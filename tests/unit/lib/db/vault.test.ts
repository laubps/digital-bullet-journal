/**
 * @jest-environment node
 *
 * vault.ts is a server-side module that calls OCI Vault.
 * Both oci-common and oci-secrets are fully mocked — no real network calls.
 */

const mockGetSecretBundle = jest.fn();

jest.mock('oci-common', () => ({
  ConfigFileAuthenticationDetailsProvider: jest
    .fn()
    .mockImplementation(() => ({})),
}));

jest.mock('oci-secrets', () => ({
  SecretsClient: jest.fn().mockImplementation(() => ({
    getSecretBundle: mockGetSecretBundle,
  })),
  models: {},
}));

import { getCredentials, _resetCredentialsCache } from '@/lib/db/vault';

// ── helpers ───────────────────────────────────────────────────────────────────

const VALID_CREDENTIALS = {
  db_user: 'testuser',
  db_password: 'testpass',
  wallet_password: 'walletpass',
  connection_string: 'journaldb_medium',
};

function makeSecretResponse(payload: object = VALID_CREDENTIALS) {
  return {
    secretBundle: {
      secretBundleContent: {
        content: Buffer.from(JSON.stringify(payload)).toString('base64'),
      },
    },
  };
}

// ── tests ─────────────────────────────────────────────────────────────────────

describe('getCredentials()', () => {
  beforeEach(() => {
    _resetCredentialsCache();
    mockGetSecretBundle.mockReset();
    process.env.OCI_CONFIG_FILE = '/mock/.oci/config';
    process.env.OCI_CONFIG_PROFILE = 'DEFAULT_FRANKFURT';
    process.env.VAULT_SECRET_OCID = 'ocid1.vaultsecret.mock';
  });

  it('fetches, base64-decodes, and returns credentials', async () => {
    mockGetSecretBundle.mockResolvedValue(makeSecretResponse());
    const creds = await getCredentials();
    expect(creds).toEqual(VALID_CREDENTIALS);
  });

  it('caches credentials — Vault is called only once across multiple calls', async () => {
    mockGetSecretBundle.mockResolvedValue(makeSecretResponse());
    await getCredentials();
    await getCredentials();
    await getCredentials();
    expect(mockGetSecretBundle).toHaveBeenCalledTimes(1);
  });

  it('throws when OCI_CONFIG_FILE env var is missing', async () => {
    delete process.env.OCI_CONFIG_FILE;
    await expect(getCredentials()).rejects.toThrow('OCI_CONFIG_FILE');
  });

  it('throws when VAULT_SECRET_OCID env var is missing', async () => {
    delete process.env.VAULT_SECRET_OCID;
    await expect(getCredentials()).rejects.toThrow('VAULT_SECRET_OCID');
  });

  it('throws when secret content is empty', async () => {
    mockGetSecretBundle.mockResolvedValue({
      secretBundle: { secretBundleContent: { content: '' } },
    });
    await expect(getCredentials()).rejects.toThrow('empty');
  });

  it.each(['db_user', 'db_password', 'wallet_password', 'connection_string'])(
    'throws when required key "%s" is missing from the secret JSON',
    async (missingKey) => {
      const incomplete = { ...VALID_CREDENTIALS, [missingKey]: undefined };
      mockGetSecretBundle.mockResolvedValue(makeSecretResponse(incomplete));
      await expect(getCredentials()).rejects.toThrow(missingKey);
    },
  );
});
