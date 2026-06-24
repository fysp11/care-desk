import { ApiError } from './api';

export const toErrorMessage = (error: unknown): string => {
  if (error instanceof ApiError) {
    const details = error.details
      ? Object.entries(error.details)
          .flatMap(([field, messages]) =>
            messages.map((message) => `${field}: ${message}`),
          )
          .join(' ')
      : '';

    return details ? `${error.message} ${details}` : error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Something went wrong.';
};
