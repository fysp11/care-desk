import {
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  ValidateBy,
} from 'class-validator';

import { PATIENT_SORT_FIELDS } from '../types.js';

const isSafePositiveIntegerString = (value: unknown): boolean => {
  const numberValue = Number(value);

  return (
    String(numberValue) === value &&
    Number.isSafeInteger(numberValue) &&
    numberValue > 0
  );
};

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

export class ListPatientsDto {
  @IsSafePositiveIntegerString('page')
  @IsOptional()
  page?: string;

  @IsSafePositiveIntegerString('limit')
  @IsOptional()
  limit?: string;

  @MaxLength(120)
  @IsString()
  @IsOptional()
  search?: string;

  @IsIn([...PATIENT_SORT_FIELDS])
  @IsOptional()
  sortBy?: string;

  @IsIn(['asc', 'desc'])
  @IsOptional()
  sortDir?: string;
}
