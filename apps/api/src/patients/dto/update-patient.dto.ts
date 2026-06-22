import {
  IsEmail,
  IsISO8601,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class UpdatePatientDto {
  firstName!: string;

  lastName!: string;

  email!: string;

  phoneNumber!: string;

  dob!: string;
}

const namePattern = /\S/;
const phoneNumberPattern = /^\+?[0-9 ()-]{7,24}$/;
const dobPattern = /^\d{4}-\d{2}-\d{2}$/;

IsString()(UpdatePatientDto.prototype, 'firstName');
Matches(namePattern, {
  message: 'firstName must contain at least one non-whitespace character.',
})(UpdatePatientDto.prototype, 'firstName');
MaxLength(80)(UpdatePatientDto.prototype, 'firstName');

IsString()(UpdatePatientDto.prototype, 'lastName');
Matches(namePattern, {
  message: 'lastName must contain at least one non-whitespace character.',
})(UpdatePatientDto.prototype, 'lastName');
MaxLength(80)(UpdatePatientDto.prototype, 'lastName');

IsEmail()(UpdatePatientDto.prototype, 'email');
MaxLength(254)(UpdatePatientDto.prototype, 'email');

IsString()(UpdatePatientDto.prototype, 'phoneNumber');
Matches(phoneNumberPattern, {
  message:
    'phoneNumber must be a plausible phone number using digits, spaces, parentheses, hyphens, and an optional leading plus.',
})(UpdatePatientDto.prototype, 'phoneNumber');
MaxLength(32)(UpdatePatientDto.prototype, 'phoneNumber');

IsString()(UpdatePatientDto.prototype, 'dob');
Matches(dobPattern, {
  message: 'dob must use YYYY-MM-DD format.',
})(UpdatePatientDto.prototype, 'dob');
IsISO8601({ strict: true }, { message: 'dob must be a valid ISO date.' })(
  UpdatePatientDto.prototype,
  'dob',
);
