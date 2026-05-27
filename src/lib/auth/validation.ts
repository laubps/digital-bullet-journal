export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MIN_PASSWORD_LENGTH = 8;

export type LoginFieldError = { field: 'email' | 'password' | 'general'; message: string };
export type SignupFieldError = {
  field: 'firstName' | 'lastName' | 'email' | 'password' | 'confirmPassword' | 'general';
  message: string;
};

/** @deprecated Use LoginFieldError */
export type FieldError = LoginFieldError;

export function validateLoginInput(
  email: unknown,
  password: unknown,
): { ok: true; email: string; password: string } | { ok: false; error: FieldError } {
  if (typeof email !== 'string' || email.trim() === '') {
    return { ok: false, error: { field: 'email', message: 'please enter your email' } };
  }
  const trimmed = email.trim();
  if (!EMAIL_REGEX.test(trimmed)) {
    return { ok: false, error: { field: 'email', message: "hmm, that doesn't look like an email" } };
  }
  if (typeof password !== 'string' || password === '') {
    return { ok: false, error: { field: 'password', message: 'please enter your password' } };
  }
  return { ok: true, email: trimmed, password };
}

export type SignupFields = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export function validateSignupInput(
  data: Record<string, unknown>,
): { ok: true; fields: SignupFields } | { ok: false; error: SignupFieldError } {
  const { firstName, lastName, email, password, confirmPassword } = data;

  if (typeof firstName !== 'string' || firstName.trim() === '') {
    return { ok: false, error: { field: 'firstName', message: 'please enter your first name' } };
  }
  if (typeof lastName !== 'string' || lastName.trim() === '') {
    return { ok: false, error: { field: 'lastName', message: 'please enter your last name' } };
  }
  if (typeof email !== 'string' || email.trim() === '') {
    return { ok: false, error: { field: 'email', message: 'please enter your email' } };
  }
  const trimmedEmail = email.trim();
  if (!EMAIL_REGEX.test(trimmedEmail)) {
    return { ok: false, error: { field: 'email', message: "hmm, that doesn't look like an email" } };
  }
  if (typeof password !== 'string' || password === '') {
    return { ok: false, error: { field: 'password', message: 'please enter a password' } };
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      ok: false,
      error: { field: 'password', message: `password must be at least ${MIN_PASSWORD_LENGTH} characters` },
    };
  }
  if (password !== confirmPassword) {
    return { ok: false, error: { field: 'confirmPassword', message: "passwords don't match" } };
  }

  return {
    ok: true,
    fields: {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: trimmedEmail,
      password,
    },
  };
}
