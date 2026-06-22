import {
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  ValidateBy,
} from 'class-validator';

import { PATIENT_SORT_FIELDS } from '../types.js';

export class ListPatientsDto {
  page?: string;

  limit?: string;

  search?: string;

  sortBy?: string;

  sortDir?: string;
}

const positiveIntegerPattern = /^[1-9]\d*$/;
const isSafePositiveIntegerString = (value: unknown): boolean =>
  typeof value === 'string' &&
  positiveIntegerPattern.test(value) &&
  Number.isSafeInteger(Number(value));
const IsSafePositiveIntegerString = (fieldName: string): PropertyDecorator =>
  ValidateBy(
    {
      name: 'isSafePositiveIntegerString',
      validator: {
        validate: (value: unknown): boolean =>
          isSafePositiveIntegerString(value),
      },
    },
    {
      message: `${fieldName} must be a positive safe integer.`,
    },
  );

IsOptional()(ListPatientsDto.prototype, 'page');
IsSafePositiveIntegerString('page')(ListPatientsDto.prototype, 'page');

IsOptional()(ListPatientsDto.prototype, 'limit');
IsSafePositiveIntegerString('limit')(ListPatientsDto.prototype, 'limit');

IsOptional()(ListPatientsDto.prototype, 'search');
IsString()(ListPatientsDto.prototype, 'search');
MaxLength(120)(ListPatientsDto.prototype, 'search');

IsOptional()(ListPatientsDto.prototype, 'sortBy');
IsIn([...PATIENT_SORT_FIELDS])(ListPatientsDto.prototype, 'sortBy');

IsOptional()(ListPatientsDto.prototype, 'sortDir');
IsIn(['asc', 'desc'])(ListPatientsDto.prototype, 'sortDir');
