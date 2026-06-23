'use client';

import { StatusMessage } from './status-message';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
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
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <p className="text-sm font-semibold uppercase text-primary">
            Care Desk
          </p>
          <CardTitle className="text-2xl">Patients management</CardTitle>
          <CardDescription>
            Sign in with a demo role to manage or review patient records.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-2">
            <Button
              disabled={isLoggingIn}
              onClick={() => onDemoLogin(demoCredentials.admin)}
              type="button"
              variant="secondary"
            >
              Admin demo
            </Button>
            <Button
              disabled={isLoggingIn}
              onClick={() => onDemoLogin(demoCredentials.user)}
              type="button"
              variant="outline"
            >
              User demo
            </Button>
          </div>

          {authNotice ? (
            <StatusMessage tone="warning">{authNotice}</StatusMessage>
          ) : null}

          {loginError ? (
            <StatusMessage tone="error">{loginError}</StatusMessage>
          ) : null}

          <form
            noValidate
            onSubmit={(event) => {
              event.preventDefault();
              onSubmit(form);
            }}
          >
            <FieldGroup>
              <Field data-invalid={errors.email ? true : undefined}>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  aria-invalid={errors.email ? 'true' : 'false'}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  autoComplete="email"
                  id="email"
                  onChange={(event) =>
                    onFieldChange('email', event.target.value)
                  }
                  type="email"
                  value={form.email}
                />
                {errors.email ? (
                  <FieldError id="email-error">{errors.email}</FieldError>
                ) : null}
              </Field>

              <Field data-invalid={errors.password ? true : undefined}>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  aria-invalid={errors.password ? 'true' : 'false'}
                  aria-describedby={
                    errors.password ? 'password-error' : undefined
                  }
                  autoComplete="current-password"
                  id="password"
                  onChange={(event) =>
                    onFieldChange('password', event.target.value)
                  }
                  type="password"
                  value={form.password}
                />
                {errors.password ? (
                  <FieldError id="password-error">
                    {errors.password}
                  </FieldError>
                ) : null}
              </Field>

              <Button
                className="w-full"
                disabled={isLoggingIn}
                type="submit"
              >
                {isLoggingIn ? 'Signing in...' : 'Sign in'}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
