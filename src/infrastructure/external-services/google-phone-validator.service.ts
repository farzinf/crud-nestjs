import { Injectable } from '@nestjs/common';
import {
  PhoneNumberUtil,
  PhoneNumberFormat,
  PhoneNumberType,
} from 'google-libphonenumber';
import {
  IPhoneNumberValidator,
  IPhoneNumberInfo,
} from '../../application/interfaces/phone-validator.interface';

@Injectable()
export class GoogleLibPhoneNumberValidator implements IPhoneNumberValidator {
  private phoneUtil: PhoneNumberUtil;

  constructor() {
    this.phoneUtil = PhoneNumberUtil.getInstance();
  }

  async validate(phoneNumber: string): Promise<IPhoneNumberInfo> {
    try {
      // Assume E.164 format, no default region needed for parsing if '+' is present
      const number = this.phoneUtil.parse(phoneNumber); // No default region needed
      const isValid = this.phoneUtil.isValidNumber(number);

      if (!isValid) {
        return { isValid: false, isMobile: false };
      }

      const numberType = this.phoneUtil.getNumberType(number);
      // Check if it's mobile or fixed_line_or_mobile (some libs might classify voip as mobile)
      const isMobile =
        numberType === PhoneNumberType.MOBILE ||
        numberType === PhoneNumberType.FIXED_LINE_OR_MOBILE;

      const e164Format = this.phoneUtil.format(number, PhoneNumberFormat.E164);

      return {
        isValid: true,
        isMobile: isMobile,
        e164Format: e164Format,
      };
    } catch (error) {
      // console.error(`Phone number validation error for ${phoneNumber}:`, error);
      return { isValid: false, isMobile: false };
    }
  }
}
