import { BadRequestException } from '@nestjs/common';

export class InvalidPhoneNumberException extends BadRequestException {
  constructor(phoneNumber: string, reason: string) {
    super(`Invalid phone number format: ${phoneNumber}. Reason: ${reason}`);
  }
}
