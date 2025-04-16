import { ConflictException } from '@nestjs/common';

export class DuplicateCustomerException extends ConflictException {
  constructor(message: string) {
    super(message);
  }
}
