export interface LoginFormState {
  readonly email: string;
  readonly password: string;
}

export type LoginErrors = Partial<Record<keyof LoginFormState, string>>;

export const emptyLoginForm: LoginFormState = {
  email: '',
  password: '',
};

export const validateLogin = (
  email: string,
  password: string,
): LoginErrors => {
  const errors: LoginErrors = {};

  if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
    errors.email = 'Enter a valid email address.';
  }

  if (!password.trim()) {
    errors.password = 'Enter a password.';
  }

  return errors;
};
