'use client';

import { StatusMessage } from './status-message';
import type { LoginErrors, LoginFormState } from '../lib/login-form';

interface LoginPanelProps {
  readonly authNotice: string | null;
  readonly form: LoginFormState;
  readonly errors: LoginErrors;
  readonly isLoggingIn: boolean;
  readonly loginError: string | null;
  readonly onDemoLogin: (credentials: LoginFormState) => void;
  readonly onFieldChange: (field: keyof LoginFormState, value: string) => void;
  readonly onSubmit: (credentials: LoginFormState) => void;
}

const demoCredentials = {
  admin: {
    email: 'admin@example.com',
    password: 'admin-password',
  },
  user: {
    email: 'user@example.com',
    password: 'user-password',
  },
} as const satisfies Record<string, LoginFormState>;

export function LoginPanel({
  authNotice,
  form,
  errors,
  isLoggingIn,
  loginError,
  onDemoLogin,
  onFieldChange,
  onSubmit,
}: LoginPanelProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <section className="w-full max-w-md rounded-md border border-slate-200 bg-white p-6 shadow-lg">
        <div>
          <p className="text-sm font-semibold uppercase text-teal-800">
            Care Desk
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-950">
            Patients management
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Sign in with a demo role to manage or review patient records.
          </p>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            className="rounded-md border border-teal-200 bg-teal-50 px-3 py-2 text-sm font-semibold text-teal-900 transition hover:bg-teal-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isLoggingIn}
            onClick={() => onDemoLogin(demoCredentials.admin)}
            type="button"
          >
            Admin demo
          </button>
          <button
            className="rounded-md border border-sky-200 bg-sky-50 px-3 py-2 text-sm font-semibold text-sky-900 transition hover:bg-sky-100 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isLoggingIn}
            onClick={() => onDemoLogin(demoCredentials.user)}
            type="button"
          >
            User demo
          </button>
        </div>

        {authNotice ? (
          <div className="mt-4">
            <StatusMessage tone="warning">{authNotice}</StatusMessage>
          </div>
        ) : null}

        {loginError ? (
          <div className="mt-4">
            <StatusMessage tone="error">{loginError}</StatusMessage>
          </div>
        ) : null}

        <form
          className="mt-5 space-y-4"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit(form);
          }}
        >
          <label
            className="block text-sm font-medium text-slate-800"
            htmlFor="email"
          >
            Email
            <input
              aria-invalid={errors.email ? 'true' : 'false'}
              aria-describedby={errors.email ? 'email-error' : undefined}
              autoComplete="email"
              className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm transition placeholder:text-slate-400 hover:border-slate-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500"
              id="email"
              onChange={(event) => onFieldChange('email', event.target.value)}
              type="email"
              value={form.email}
            />
            {errors.email ? (
              <span
                className="mt-1 block text-xs font-medium text-red-700"
                id="email-error"
              >
                {errors.email}
              </span>
            ) : null}
          </label>

          <label
            className="block text-sm font-medium text-slate-800"
            htmlFor="password"
          >
            Password
            <input
              aria-invalid={errors.password ? 'true' : 'false'}
              aria-describedby={
                errors.password ? 'password-error' : undefined
              }
              autoComplete="current-password"
              className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm transition placeholder:text-slate-400 hover:border-slate-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500"
              id="password"
              onChange={(event) =>
                onFieldChange('password', event.target.value)
              }
              type="password"
              value={form.password}
            />
            {errors.password ? (
              <span
                className="mt-1 block text-xs font-medium text-red-700"
                id="password-error"
              >
                {errors.password}
              </span>
            ) : null}
          </label>

          <button
            className="w-full rounded-md bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-400"
            disabled={isLoggingIn}
            type="submit"
          >
            {isLoggingIn ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </section>
    </main>
  );
}
