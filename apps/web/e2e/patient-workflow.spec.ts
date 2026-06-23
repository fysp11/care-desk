import {
  expect,
  test,
  type APIRequestContext,
  type Page,
} from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { FAILURE_SIMULATION_STORAGE_KEY } from '../lib/failure-simulation';
import { SESSION_STORAGE_KEY } from '../lib/session';

const apiBaseURL =
  process.env.PLAYWRIGHT_API_BASE_URL ?? 'http://localhost:3001';
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');

const tokenWithExpiry = (exp: number): string => {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256' })).toString(
    'base64url',
  );
  const payload = Buffer.from(JSON.stringify({ exp })).toString('base64url');

  return `${header}.${payload}.signature`;
};

const loginAs = async (page: Page, role: 'Admin' | 'User'): Promise<void> => {
  await page.goto('/');
  await page.getByRole('button', { name: `${role} demo` }).click();

  const expectedEmail =
    role === 'Admin' ? 'admin@example.com' : 'user@example.com';
  const expectedRole = role.toLowerCase();

  await expect(page.getByText(expectedEmail)).toBeVisible();
  await expect(page.getByText(expectedRole, { exact: true })).toBeVisible();
  await expect(page.getByText('ada.brooks@example.com')).toBeVisible();
};

const loginViaApi = async (
  request: APIRequestContext,
): Promise<{ readonly token: string }> => {
  const loginResponse = await request.post(`${apiBaseURL}/auth/login`, {
    data: {
      email: 'admin@example.com',
      password: 'admin-password',
    },
  });

  expect(loginResponse.status()).toBe(200);

  return (await loginResponse.json()) as { readonly token: string };
};

const createPatientViaApi = async (
  request: APIRequestContext,
  token: string,
  index: number,
): Promise<void> => {
  const createResponse = await request.post(`${apiBaseURL}/patients`, {
    data: {
      dob: `1988-03-${String(index + 1).padStart(2, '0')}`,
      email: `pagination.${index}.${Date.now()}@example.com`,
      firstName: `Page${index}`,
      lastName: `Extra${index}`,
      phoneNumber: `+1 555-02${String(index).padStart(2, '0')}`,
    },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  expect(createResponse.status()).toBe(201);
};

const setFailureSimulation = async (
  page: Page,
  target: 'detail' | 'list',
): Promise<void> => {
  await page.evaluate(
    ({ key, selectedTarget }) => {
      window.localStorage.setItem(
        key,
        JSON.stringify({
          enabled: true,
          latencyMs: 0,
          target: selectedTarget,
        }),
      );
    },
    {
      key: FAILURE_SIMULATION_STORAGE_KEY,
      selectedTarget: target,
    },
  );
};

test.describe('patient management browser smoke', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(() => {
    execFileSync('bun', ['--filter', '@care-desk/api', 'db:seed'], {
      cwd: repoRoot,
      stdio: 'ignore',
    });
  });

  test('admin can search, create, edit, inspect, and delete a patient', async ({
    page,
  }) => {
    await loginAs(page, 'Admin');

    await page.getByLabel('Search patients').fill('Ada');
    await expect(page.getByText('ada.brooks@example.com')).toBeVisible();
    await expect(page.getByText('theo.carter@example.com')).toBeHidden();
    await page.getByLabel('Search patients').fill('');
    await page
      .getByRole('button', { name: 'Sort by DOB, currently not sorted' })
      .click();
    await expect(
      page.getByRole('button', { name: 'Sort by DOB, currently ascending' }),
    ).toBeVisible();

    const runId = Date.now();
    const email = `browser.smoke.${runId}@example.com`;
    const lastName = `Smoke${runId}`;

    await page.getByRole('button', { name: 'New patient' }).click();
    await page.getByLabel('First name', { exact: true }).fill('Browser');
    await page.getByLabel('Last name', { exact: true }).fill(lastName);
    await page.getByLabel('Email', { exact: true }).fill(email);
    await page.getByLabel('Phone number').fill('+1 555 0999');
    await page.getByLabel('Date of birth').fill('1990-01-15');
    await page.getByRole('button', { name: 'Create', exact: true }).click();

    const createdRow = page.getByRole('row').filter({ hasText: email });
    await expect(createdRow).toBeVisible();
    await expect(
      page.getByRole('heading', { name: `Browser ${lastName}` }),
    ).toBeVisible();

    await createdRow.getByRole('button', { name: 'Edit' }).click();
    await page.getByLabel('First name', { exact: true }).fill('Browser Edited');
    await page.getByRole('button', { name: 'Save' }).click();

    const editedRow = page.getByRole('row').filter({ hasText: email });
    await expect(
      editedRow.getByRole('cell', { name: 'Browser Edited' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: `Browser Edited ${lastName}` }),
    ).toBeVisible();

    page.once('dialog', (dialog) => dialog.accept());
    await editedRow.getByRole('button', { name: 'Delete' }).click();

    await expect(page.getByText(email)).toHaveCount(0);
  });

  test('login validates input, persists session, reloads, and logs out', async ({
    page,
  }) => {
    await page.goto('/');

    await page.getByLabel('Email').fill('not-an-email');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page.getByText('Enter a valid email address.')).toBeVisible();
    await expect(page.getByText('Enter a password.')).toBeVisible();

    await page.getByLabel('Email').fill('admin@example.com');
    await page.getByLabel('Password').fill('wrong-password');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page.getByText('Email or password is invalid.')).toBeVisible();

    await page.getByLabel('Password').fill('admin-password');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page.getByText('admin@example.com')).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'New patient' }),
    ).toBeVisible();
    await expect(
      page.evaluate(
        (key) => window.localStorage.getItem(key),
        SESSION_STORAGE_KEY,
      ),
    ).resolves.toContain('admin@example.com');

    await page.reload();

    await expect(page.getByText('admin@example.com')).toBeVisible();
    await expect(page.getByText('ada.brooks@example.com')).toBeVisible();

    await page.getByRole('button', { name: 'Logout' }).click();

    await expect(page.getByText('You have signed out.')).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Admin demo' }),
    ).toBeVisible();
    await expect(
      page.evaluate(
        (key) => window.localStorage.getItem(key),
        SESSION_STORAGE_KEY,
      ),
    ).resolves.toBeNull();
  });

  test('pagination and page-size controls navigate seeded list pages', async ({
    page,
    request,
  }) => {
    const { token } = await loginViaApi(request);

    await Promise.all([
      createPatientViaApi(request, token, 1),
      createPatientViaApi(request, token, 2),
    ]);

    await loginAs(page, 'Admin');

    await page.getByLabel('Rows').selectOption('5');
    await expect(page.getByText('Page 1 of 2')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Previous' })).toBeDisabled();
    await expect(
      page.getByRole('button', { exact: true, name: 'Next' }),
    ).toBeEnabled();

    await page.getByRole('button', { exact: true, name: 'Next' }).click();

    await expect(page.getByText('Page 2 of 2')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Previous' })).toBeEnabled();
    await expect(
      page.getByRole('button', { exact: true, name: 'Next' }),
    ).toBeDisabled();

    await page.getByLabel('Rows').selectOption('10');

    await expect(page.getByText('Page 1 of 1')).toBeVisible();
  });

  test('list failure state can be retried after local simulation is disabled', async ({
    page,
  }) => {
    await loginAs(page, 'Admin');

    await setFailureSimulation(page, 'list');
    await page.reload();

    const listErrorAlert = page
      .getByRole('alert')
      .filter({ hasText: 'Unable to load patients' });

    await expect(listErrorAlert).toBeVisible();
    await expect(page.getByText('Simulated list failure.')).toBeVisible();

    await page.getByLabel('Local reliability simulation').uncheck();

    await expect(page.getByText('ada.brooks@example.com')).toBeVisible();
    await expect(listErrorAlert).toHaveCount(0);
  });

  test('detail failure state can be retried after local simulation is disabled', async ({
    page,
  }) => {
    await loginAs(page, 'Admin');

    await setFailureSimulation(page, 'detail');
    await page.reload();
    await expect(page.getByText('ada.brooks@example.com')).toBeVisible();
    await page.getByRole('button', { name: 'Details' }).first().click();

    const detailErrorAlert = page
      .getByRole('alert')
      .filter({ hasText: 'Unable to refresh record' });

    await expect(detailErrorAlert).toBeVisible();
    await expect(page.getByText('Simulated detail failure.')).toBeVisible();

    await page.getByLabel('Local reliability simulation').uncheck();
    await page.getByRole('button', { name: 'Retry details' }).click();

    await expect(page.getByText('Patient record')).toBeVisible();
    await expect(detailErrorAlert).toHaveCount(0);
  });

  test('user role can view patient details without mutation controls', async ({
    page,
  }) => {
    await loginAs(page, 'User');

    await expect(page.getByText('View-only role')).toBeVisible();
    await expect(page.getByRole('button', { name: 'New patient' })).toHaveCount(
      0,
    );
    await expect(page.getByRole('button', { name: 'Edit' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Delete' })).toHaveCount(0);

    const detailsButtons = page.getByRole('button', { name: 'Details' });
    await expect(detailsButtons).not.toHaveCount(0);
    await detailsButtons.first().click();

    await expect(
      page.getByRole('heading', { name: 'Ada Brooks' }),
    ).toBeVisible();
    await expect(page.getByText('Patient record')).toBeVisible();
  });

  test('user token is rejected by the mutation API even if called directly', async ({
    page,
    request,
  }) => {
    await loginAs(page, 'User');

    const loginResponse = await request.post(`${apiBaseURL}/auth/login`, {
      data: {
        email: 'user@example.com',
        password: 'user-password',
      },
    });
    const loginBody = (await loginResponse.json()) as { token: string };
    const createResponse = await request.post(`${apiBaseURL}/patients`, {
      data: {
        dob: '1990-01-15',
        email: 'direct.user.mutation@example.com',
        firstName: 'Direct',
        lastName: 'Mutation',
        phoneNumber: '+1 555 0888',
      },
      headers: {
        Authorization: `Bearer ${loginBody.token}`,
      },
    });

    expect(createResponse.status()).toBe(403);
    await expect(page.getByRole('button', { name: 'New patient' })).toHaveCount(
      0,
    );
    await expect(
      page.getByText('direct.user.mutation@example.com'),
    ).toHaveCount(0);
  });

  test('denied localStorage still allows interactive admin login', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window, 'localStorage', {
        configurable: true,
        get() {
          throw new Error('storage denied');
        },
      });
    });

    await loginAs(page, 'Admin');

    await expect(
      page.getByRole('button', { name: 'New patient' }),
    ).toBeVisible();
    await expect(page.getByText('ada.brooks@example.com')).toBeVisible();
  });

  test('unauthorized patient load clears the session and returns to login', async ({
    page,
  }) => {
    const futureExp = Math.floor(Date.now() / 1000) + 3600;

    await page.addInitScript(
      ({ key, token }) => {
        window.localStorage.setItem(
          key,
          JSON.stringify({
            token,
            user: {
              email: 'admin@example.com',
              role: 'admin',
            },
          }),
        );
      },
      {
        key: SESSION_STORAGE_KEY,
        token: tokenWithExpiry(futureExp),
      },
    );
    await page.route(`${apiBaseURL}/patients?**`, (route) =>
      route.fulfill({
        body: JSON.stringify({
          code: 'TOKEN_EXPIRED',
          message: 'Token expired.',
        }),
        contentType: 'application/json',
        status: 401,
      }),
    );

    await page.goto('/');

    await expect(
      page.getByText('Your session expired or was rejected.'),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Admin demo' }),
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'New patient' })).toHaveCount(
      0,
    );
    await expect(
      page.evaluate(
        (key) => window.localStorage.getItem(key),
        SESSION_STORAGE_KEY,
      ),
    ).resolves.toBeNull();
  });
});
