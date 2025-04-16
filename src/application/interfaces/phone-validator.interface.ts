export interface IPhoneNumberInfo {
  isValid: boolean;
  isMobile: boolean;
  e164Format?: string; // Return the validated/formatted number
}

export interface IPhoneNumberValidator {
  validate(phoneNumber: string): Promise<IPhoneNumberInfo>;
}

export const PHONE_NUMBER_VALIDATOR = Symbol('IPhoneNumberValidator');
