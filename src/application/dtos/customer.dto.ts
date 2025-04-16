import { ApiProperty } from '@nestjs/swagger';
import { Customer } from '../../core/aggregates/customer.aggregate';

export class CustomerDto {
  @ApiProperty()
  id: string;
  @ApiProperty()
  firstName: string;
  @ApiProperty()
  lastName: string;
  @ApiProperty()
  dateOfBirth: string;
  @ApiProperty()
  phoneNumber: string;
  @ApiProperty()
  email: string;
  @ApiProperty()
  bankAccountNumber: string;

  static fromAggregate(customer: Customer): CustomerDto {
    const dto = new CustomerDto();
    dto.id = customer.id;
    dto.firstName = customer.firstName;
    dto.lastName = customer.lastName;
    dto.dateOfBirth = customer.dateOfBirth.toISOString();
    dto.phoneNumber = customer.phoneNumber.value;
    dto.email = customer.email.value;
    dto.bankAccountNumber = customer.bankAccountNumber;
    return dto;
  }
}
