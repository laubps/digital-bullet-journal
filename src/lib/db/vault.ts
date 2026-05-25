/** Shape of the JSON secret stored in OCI Vault. */
export interface VaultCredentials {
  db_user: string;
  db_password: string;
  wallet_password: string;
  connection_string: string;
}

const REQUIRED_KEYS: (keyof VaultCredentials)[] = [
  'db_user',
  'db_password',
  'wallet_password',
  'connection_string',
];

/** In-memory cache — Vault is only called once per process lifetime. */
let cachedCredentials: VaultCredentials | null = null;

/**
 * Fetches DB credentials from OCI Vault.
 *
 * oci-common and oci-secrets are dynamically imported inside this function
 * so webpack never encounters them during compilation. This prevents the
 * build from hanging when analysing native/heavy OCI SDK modules.
 */
export async function getCredentials(): Promise<VaultCredentials> {
  if (cachedCredentials) return cachedCredentials;

  const configFilePath = process.env.OCI_CONFIG_FILE;
  const profile = process.env.OCI_CONFIG_PROFILE ?? 'DEFAULT';
  const secretId = process.env.VAULT_SECRET_OCID;

  if (!configFilePath) {
    throw new Error('Missing required environment variable: OCI_CONFIG_FILE');
  }
  if (!secretId) {
    throw new Error('Missing required environment variable: VAULT_SECRET_OCID');
  }

  // Dynamic imports — invisible to webpack at build time
  const { ConfigFileAuthenticationDetailsProvider } = await import('oci-common');
  const secretsService = await import('oci-secrets');

  const provider = new ConfigFileAuthenticationDetailsProvider(
    configFilePath,
    profile,
  );

  const client = new secretsService.SecretsClient({
    authenticationDetailsProvider: provider,
  });

  const response = await client.getSecretBundle({ secretId });

  const bundleContent = response.secretBundle.secretBundleContent as {
    content?: string;
  };

  if (!bundleContent?.content) {
    throw new Error('Vault secret content is empty');
  }

  const decoded = Buffer.from(bundleContent.content, 'base64').toString('utf-8');
  const parsed = JSON.parse(decoded) as VaultCredentials;

  for (const key of REQUIRED_KEYS) {
    if (!parsed[key]) {
      throw new Error(`Vault secret is missing required key: "${key}"`);
    }
  }

  cachedCredentials = parsed;
  return cachedCredentials;
}

/** Resets the in-memory cache. Exposed for testing only. */
export function _resetCredentialsCache(): void {
  cachedCredentials = null;
}
