import { Test, TestingModule } from '@nestjs/testing';
import {
  PhoneNumberUtil,
  PhoneNumber,
  PhoneNumberFormat,
  PhoneNumberType,
} from 'google-libphonenumber';
import { GoogleLibPhoneNumberValidator } from './google-phone-validator.service';

jest.mock('google-libphonenumber', () => {
  const mockPhoneNumberUtil = {
    parse: jest.fn(),
    isValidNumber: jest.fn(),
    getNumberType: jest.fn(),
    format: jest.fn(),
    getRegionCodeForNumber: jest.fn(),
    isPossibleNumber: jest.fn(),
    isMobileNumber: jest.fn(),
    getCountryCodeForRegion: jest.fn(),
    getNationalSignificantNumber: jest.fn(),
    getCountryCodeOrDefault: jest.fn(),
    getCountryCode: jest.fn(),
  };
  return {
    PhoneNumberUtil: {
      getInstance: jest.fn(() => mockPhoneNumberUtil),
    },
    PhoneNumberFormat: {
      E164: 'E164',
    },
    PhoneNumberType: {
      MOBILE: 'MOBILE',
      FIXED_LINE_OR_MOBILE: 'FIXED_LINE_OR_MOBILE',
      FIXED_LINE: 'FIXED_LINE',
      UNKNOWN: 'UNKNOWN',
    },
  };
});

describe('GoogleLibPhoneNumberValidator', () => {
  let validator: GoogleLibPhoneNumberValidator;
  let mockPhoneUtil: jest.Mocked<PhoneNumberUtil>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GoogleLibPhoneNumberValidator],
    }).compile();

    validator = module.get<GoogleLibPhoneNumberValidator>(
      GoogleLibPhoneNumberValidator,
    );
    mockPhoneUtil =
      PhoneNumberUtil.getInstance() as jest.Mocked<PhoneNumberUtil>;
  });

  it('should be defined', () => {
    expect(validator).toBeDefined();
  });

  describe('validate', () => {
    it('should return valid mobile phone number info', async () => {
      const phoneNumber = '+16502530000';
      const parsedNumber = {
        getCountryCode: jest.fn().mockReturnValue(1),
        getNationalNumber: jest.fn().mockReturnValue(6502530000),
        getCountryCodeOrDefault: jest.fn().mockReturnValue(1),
        hasCountryCode: jest.fn().mockReturnValue(true),
        hasNationalNumber: jest.fn().mockReturnValue(true),
        isPossibleNumber: jest.fn().mockReturnValue(true),
        isMobileNumber: jest.fn().mockReturnValue(true),
        getNationalSignificantNumber: jest.fn().mockReturnValue('6502530000'),
      } as unknown as PhoneNumber;
      mockPhoneUtil.parse.mockReturnValue(parsedNumber);
      mockPhoneUtil.isValidNumber.mockReturnValue(true);
      mockPhoneUtil.getNumberType.mockReturnValue(PhoneNumberType.MOBILE);
      mockPhoneUtil.format.mockReturnValue('+16502530000');

      const result = await validator.validate(phoneNumber);

      expect(mockPhoneUtil.parse).toHaveBeenCalledWith(phoneNumber);
      expect(mockPhoneUtil.isValidNumber).toHaveBeenCalledWith(parsedNumber);
      expect(mockPhoneUtil.getNumberType).toHaveBeenCalledWith(parsedNumber);
      expect(mockPhoneUtil.format).toHaveBeenCalledWith(
        parsedNumber,
        PhoneNumberFormat.E164,
      );
      expect(result).toEqual({
        isValid: true,
        isMobile: true,
        e164Format: '+16502530000',
      });
    });

    it('should return valid fixed line or mobile phone number info', async () => {
      const phoneNumber = '+16502530000';
      const parsedNumber = {
        getCountryCode: jest.fn().mockReturnValue(1),
        getNationalNumber: jest.fn().mockReturnValue(6502530000),
        getCountryCodeOrDefault: jest.fn().mockReturnValue(1),
        hasCountryCode: jest.fn().mockReturnValue(true),
        hasNationalNumber: jest.fn().mockReturnValue(true),
        isPossibleNumber: jest.fn().mockReturnValue(true),
        isMobileNumber: jest.fn().mockReturnValue(true),
        getNationalSignificantNumber: jest.fn().mockReturnValue('6502530000'),
      } as unknown as PhoneNumber;
      mockPhoneUtil.parse.mockReturnValue(parsedNumber);
      mockPhoneUtil.isValidNumber.mockReturnValue(true);
      // mockPhoneUtil
      //   .getNumberType()
      //   .mockReturnValue(PhoneNumberType.FIXED_LINE_OR_MOBILE);
      mockPhoneUtil.getNumberType.mockReturnValue(
        PhoneNumberType.FIXED_LINE_OR_MOBILE,
      );
      mockPhoneUtil.format.mockReturnValue('+16502530000');

      const result = await validator.validate(phoneNumber);

      expect(result).toEqual({
        isValid: true,
        isMobile: true,
        e164Format: '+16502530000',
      });
    });

    it('should return invalid info for an invalid phone number', async () => {
      const phoneNumber = 'invalid-phone';
      const parsedNumber = {
        getCountryCode: jest.fn().mockReturnValue(1),
        getNationalNumber: jest.fn().mockReturnValue(6502530000),
        getCountryCodeOrDefault: jest.fn().mockReturnValue(1),
        hasCountryCode: jest.fn().mockReturnValue(true),
        hasNationalNumber: jest.fn().mockReturnValue(true),
        isPossibleNumber: jest.fn().mockReturnValue(true),
        isMobileNumber: jest.fn().mockReturnValue(true),
        getNationalSignificantNumber: jest.fn().mockReturnValue('6502530000'),
      } as unknown as PhoneNumber;
      mockPhoneUtil.parse.mockReturnValue(parsedNumber);
      mockPhoneUtil.isValidNumber.mockReturnValue(false);

      const result = await validator.validate(phoneNumber);

      expect(mockPhoneUtil.parse).toHaveBeenCalledWith(phoneNumber);
      expect(mockPhoneUtil.isValidNumber).toHaveBeenCalledWith(parsedNumber);
      expect(result).toEqual({ isValid: false, isMobile: false });
    });

    it('should return invalid info if libphonenumber throws an error', async () => {
      const phoneNumber = '+16502530000';
      mockPhoneUtil.parse.mockImplementation(() => {
        throw new Error('Parse error');
      });

      const result = await validator.validate(phoneNumber);

      expect(mockPhoneUtil.parse).toHaveBeenCalledWith(phoneNumber);
      expect(result).toEqual({ isValid: false, isMobile: false });
    });

    // it('should return false isMobile when number type is fixed line', async () => {
    //   const phoneNumber = '+16502530000';
    //   const parsedNumber = {
    //     getCountryCode: jest.fn().mockReturnValue(1),
    //     getNationalNumber: jest.fn().mockReturnValue(6502530000),
    //     getCountryCodeOrDefault: jest.fn().mockReturnValue(1),
    //     hasCountryCode: jest.fn().mockReturnValue(true),
    //     hasNationalNumber: jest.fn().mockReturnValue(true),
    //     isPossibleNumber: jest.fn().mockReturnValue(true),
    //     isMobileNumber: jest.fn().mockReturnValue(true),
    //     getNationalSignificantNumber: jest.fn().mockReturnValue('6502530000'),
    //   } as unknown as PhoneNumber;
    //   mockPhoneUtil.parse.mockReturnValue(parsedNumber);
    //   mockPhoneUtil.isValidNumber.mockReturnValue(true);
    //   mockPhoneUtil.getNumberType.mockReturnValue(PhoneNumberType.FIXED_LINE);

    //   const result = await validator.validate(phoneNumber);

    //   expect(result).toEqual({
    //     isValid: true,
    //     isMobile: false,
    //   });
    // });
    // it('should return false isMobile when number type is unknown', async () => {
    //   const phoneNumber = '+16502530000';
    //   const parsedNumber = {
    //     getCountryCode: jest.fn().mockReturnValue(1),
    //     getNationalNumber: jest.fn().mockReturnValue(6502530000),
    //     getCountryCodeOrDefault: jest.fn().mockReturnValue(1),
    //     hasCountryCode: jest.fn().mockReturnValue(true),
    //     hasNationalNumber: jest.fn().mockReturnValue(true),
    //     isPossibleNumber: jest.fn().mockReturnValue(true),
    //     isMobileNumber: jest.fn().mockReturnValue(true),
    //     getNationalSignificantNumber: jest.fn().mockReturnValue('6502530000'),
    //   } as unknown as PhoneNumber;
    //   mockPhoneUtil.parse.mockReturnValue(parsedNumber);
    //   mockPhoneUtil.isValidNumber.mockReturnValue(true);
    //   mockPhoneUtil.getNumberType.mockReturnValue(PhoneNumberType.UNKNOWN);

    //   const result = await validator.validate(phoneNumber);

    //   expect(result).toEqual({
    //     isValid: true,
    //     isMobile: false,
    //   });
    // });
  });
});
