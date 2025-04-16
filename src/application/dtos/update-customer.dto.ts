import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsDateString,
  Matches,
  Length,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCustomerDto {
  @ApiProperty({ example: 'John', description: 'Customer first name' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Customer last name' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    example: '1990-05-15',
    description: 'Customer date of birth (YYYY-MM-DD)',
  })
  @IsDateString()
  @IsNotEmpty()
  dateOfBirth: string; // Use string for input, convert later

  @ApiProperty({
    example: '+16502530000',
    description: 'Customer mobile phone number in E.164 format',
  })
  // @IsPhoneNumber() // class-validator's IsPhoneNumber is basic, use custom validation pipe/logic for libphonenumber
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+[1-9]\d{1,14}$/, {
    message: 'PhoneNumber must be in E.164 format (e.g., +16502530000)',
  })
  phoneNumber: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Customer email address (must be unique)',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'NL91ABNA0417164300',
    description: 'Customer bank account number',
  })
  @IsString()
  @IsNotEmpty()
  @Length(5, 34)
  bankAccountNumber: string;
}
