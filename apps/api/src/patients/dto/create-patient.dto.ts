import {
  IsEmail,
  IsISO8601,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

const namePattern = /\S/;
const phoneNumberPattern = /^\+?[0-9 ()-]{7,24}$/;
const dobPattern = /^\d{4}-\d{2}-\d{2}$/;

export class CreatePatientDto {
  @MaxLength(80)
  @Matches(namePattern, {
    message: 'firstName must contain at least one non-whitespace character.',
  })
  @IsString()
  firstName!: string;

  @MaxLength(80)
  @Matches(namePattern, {
    message: 'lastName must contain at least one non-whitespace character.',
  })
  @IsString()
  lastName!: string;

  @MaxLength(254)
  @IsEmail()
  email!: string;

  @MaxLength(32)
  @Matches(phoneNumberPattern, {
    message:
      'phoneNumber must be a plausible phone number using digits, spaces, parentheses, hyphens, and an optional leading plus.',
  })
  @IsString()
  phoneNumber!: string;

  @IsISO8601({ strict: true }, { message: 'dob must be a valid ISO date.' })
  @Matches(dobPattern, {
    message: 'dob must use YYYY-MM-DD format.',
  })
  @IsString()
  dob!: string;
}
