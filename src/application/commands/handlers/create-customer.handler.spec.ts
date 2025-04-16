import { Test, TestingModule } from '@nestjs/testing';
import { EventBus } from '@nestjs/cqrs';
import { CreateCustomerHandler } from './create-customer.handler';
import { CreateCustomerCommand } from '../impl/create-customer.command';
import {
  ICustomerRepository,
  CUSTOMER_REPOSITORY,
} from '../../../core/repositories/customer.repository.interface';
import {
  IPhoneNumberValidator,
  PHONE_NUMBER_VALIDATOR,
  IPhoneNumberInfo,
} from '../../interfaces/phone-validator.interface';
import { Customer, Email } from '../../../core/aggregates/customer.aggregate';
import { DuplicateCustomerException } from '../../exceptions/duplicate-customer.exception';
import { InvalidPhoneNumberException } from '../../exceptions/invalid-phone-number.exception';

// Mock repositories and services
const mockCustomerRepository = {
  save: jest.fn(),
  findByEmail: jest.fn(),
  findByUniqueness: jest.fn(),
};

const mockPhoneValidator = {
  validate: jest.fn(),
};

const mockEventBus = {
  publish: jest.fn(),
};

describe('CreateCustomerHandler', () => {
  let handler: CreateCustomerHandler;
  let customerRepository: ICustomerRepository;
  let phoneValidator: IPhoneNumberValidator;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateCustomerHandler,
        { provide: CUSTOMER_REPOSITORY, useValue: mockCustomerRepository },
        { provide: PHONE_NUMBER_VALIDATOR, useValue: mockPhoneValidator },
        { provide: EventBus, useValue: mockEventBus },
      ],
    }).compile();

    handler = module.get<CreateCustomerHandler>(CreateCustomerHandler);
    customerRepository = module.get<ICustomerRepository>(CUSTOMER_REPOSITORY);
    phoneValidator = module.get<IPhoneNumberValidator>(PHONE_NUMBER_VALIDATOR);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    const command = new CreateCustomerCommand(
      'John',
      'Doe',
      new Date('1990-01-01'),
      '+16502530000',
      'john.doe@example.com',
      'NL91ABNA0417164300',
    );

    const mockCustomer = Customer.create({
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: new Date('1990-01-01'),
      phoneNumber: '+16502530000',
      email: 'john.doe@example.com',
      bankAccountNumber: 'NL91ABNA0417164300',
    });

    it('should create a customer successfully', async () => {
      const phoneInfo: IPhoneNumberInfo = {
        isValid: true,
        isMobile: true,
        e164Format: '+16502530000',
      };
      phoneValidator.validate = jest.fn().mockResolvedValue(phoneInfo);
      customerRepository.findByEmail = jest.fn().mockResolvedValue(null);
      customerRepository.findByUniqueness = jest.fn().mockResolvedValue(null);
      customerRepository.save = jest.fn().mockResolvedValue(mockCustomer);

      const result = await handler.execute(command);

      expect(phoneValidator.validate).toHaveBeenCalledWith(command.phoneNumber);
      expect(customerRepository.findByEmail).toHaveBeenCalledWith(
        new Email(command.email),
      );
      expect(customerRepository.findByUniqueness).toHaveBeenCalledWith(
        command.firstName,
        command.lastName,
        command.dateOfBirth,
      );
      expect(customerRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: command.firstName,
          lastName: command.lastName,
          dateOfBirth: command.dateOfBirth,
          phoneNumber: expect.objectContaining({ value: command.phoneNumber }),
          email: expect.objectContaining({ value: command.email }),
          bankAccountNumber: command.bankAccountNumber,
        }),
      );
      expect(result).toEqual(mockCustomer);
    });

    it('should throw InvalidPhoneNumberException for an invalid phone number', async () => {
      phoneValidator.validate = jest.fn().mockResolvedValue({
        isValid: false,
        isMobile: false,
      });

      await expect(handler.execute(command)).rejects.toThrow(
        InvalidPhoneNumberException,
      );
      expect(customerRepository.findByEmail).not.toHaveBeenCalled();
      expect(customerRepository.findByUniqueness).not.toHaveBeenCalled();
      expect(customerRepository.save).not.toHaveBeenCalled();
    });

    it('should throw InvalidPhoneNumberException for a non-mobile phone number', async () => {
      phoneValidator.validate = jest.fn().mockResolvedValue({
        isValid: true,
        isMobile: false,
      });

      await expect(handler.execute(command)).rejects.toThrow(
        InvalidPhoneNumberException,
      );
      expect(customerRepository.findByEmail).not.toHaveBeenCalled();
      expect(customerRepository.findByUniqueness).not.toHaveBeenCalled();
      expect(customerRepository.save).not.toHaveBeenCalled();
    });

    it('should throw DuplicateCustomerException if email already exists', async () => {
      phoneValidator.validate = jest.fn().mockResolvedValue({
        isValid: true,
        isMobile: true,
        e164Format: '+16502530000',
      });
      customerRepository.findByEmail = jest
        .fn()
        .mockResolvedValue(mockCustomer);

      await expect(handler.execute(command)).rejects.toThrow(
        DuplicateCustomerException,
      );
      expect(customerRepository.findByUniqueness).not.toHaveBeenCalled();
      expect(customerRepository.save).not.toHaveBeenCalled();
    });

    it('should throw DuplicateCustomerException if customer with given uniqueness already exists', async () => {
      phoneValidator.validate = jest.fn().mockResolvedValue({
        isValid: true,
        isMobile: true,
        e164Format: '+16502530000',
      });
      customerRepository.findByEmail = jest.fn().mockResolvedValue(null);
      customerRepository.findByUniqueness = jest
        .fn()
        .mockResolvedValue(mockCustomer);

      await expect(handler.execute(command)).rejects.toThrow(
        DuplicateCustomerException,
      );
      expect(customerRepository.save).not.toHaveBeenCalled();
    });
  });
});
