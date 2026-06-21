import { BadRequestException, ValidationPipe } from '@nestjs/common';
import type { ValidationError } from 'class-validator';

type ValidationDetails = Record<string, string[]>;

const collectValidationDetails = (
  errors: readonly ValidationError[],
  parentPath = '',
): ValidationDetails => {
  const details: ValidationDetails = {};

  for (const error of errors) {
    const propertyPath = parentPath
      ? `${parentPath}.${error.property}`
      : error.property;
    const messages = error.constraints ? Object.values(error.constraints) : [];

    if (messages.length > 0) {
      details[propertyPath] = messages;
    }

    if (error.children && error.children.length > 0) {
      Object.assign(
        details,
        collectValidationDetails(error.children, propertyPath),
      );
    }
  }

  return details;
};

export const createValidationPipe = (): ValidationPipe =>
  new ValidationPipe({
    exceptionFactory: (errors) =>
      new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed.',
        details: collectValidationDetails(errors),
      }),
    forbidNonWhitelisted: true,
    forbidUnknownValues: true,
    transform: false,
    validationError: {
      target: false,
      value: false,
    },
    whitelist: true,
  });
