import {
  IsEmail,
  IsISO8601,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreatePatientDto {
  firstName!: string;

  lastName!: string;

  email!: string;

  phoneNumber!: string;

  dob!: string;
}

const namePattern = /\S/;
const phoneNumberPattern = /^\+?[0-9 ()-]{7,24}$/;
const dobPattern = /^\d{4}-\d{2}-\d{2}$/;

IsString()(CreatePatientDto.prototype, 'firstName');
Matches(namePattern, {
  message: 'firstName must contain at least one non-whitespace character.',
})(CreatePatientDto.prototype, 'firstName');
MaxLength(80)(CreatePatientDto.prototype, 'firstName');

IsString()(CreatePatientDto.prototype, 'lastName');
Matches(namePattern, {
  message: 'lastName must contain at least one non-whitespace character.',
})(CreatePatientDto.prototype, 'lastName');
MaxLength(80)(CreatePatientDto.prototype, 'lastName');

IsEmail()(CreatePatientDto.prototype, 'email');
MaxLength(254)(CreatePatientDto.prototype, 'email');

IsString()(CreatePatientDto.prototype, 'phoneNumber');
Matches(phoneNumberPattern, {
  message:
    'phoneNumber must be a plausible phone number using digits, spaces, parentheses, hyphens, and an optional leading plus.',
})(CreatePatientDto.prototype, 'phoneNumber');
MaxLength(32)(CreatePatientDto.prototype, 'phoneNumber');

IsString()(CreatePatientDto.prototype, 'dob');
Matches(dobPattern, {
  message: 'dob must use YYYY-MM-DD format.',
})(CreatePatientDto.prototype, 'dob');
IsISO8601({ strict: true }, { message: 'dob must be a valid ISO date.' })(
  CreatePatientDto.prototype,
  'dob',
);
