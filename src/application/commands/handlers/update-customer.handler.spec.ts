import { Test, TestingModule } from '@nestjs/testing';
import { EventBus } from '@nestjs/cqrs';
import { UpdateCustomerHandler } from './update-customer.handler';
import { UpdateCustomerCommand } from '../impl/update-customer.command';
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
import { InvalidPhoneNumberException } from '../../exceptions/invalid-phone-number.exception';

const mockCustomerRepository = {
  save: jest.fn(),
  findById: jest.fn(),
  findByEmail: jest.fn(),
  findByUniqueness: jest.fn(),
};

const mockPhoneValidator = {
  validate: jest.fn(),
};

const mockEventBus = {
  publish: jest.fn(),
};

describe('UpdateCustomerHandler', () => {
  let handler: UpdateCustomerHandler;
  let customerRepository: ICustomerRepository;
  let phoneValidator: IPhoneNumberValidator;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateCustomerHandler,
        { provide: CUSTOMER_REPOSITORY, useValue: mockCustomerRepository },
        { provide: PHONE_NUMBER_VALIDATOR, useValue: mockPhoneValidator },
        { provide: EventBus, useValue: mockEventBus },
      ],
    }).compile();

    handler = module.get<UpdateCustomerHandler>(UpdateCustomerHandler);
    customerRepository = module.get<ICustomerRepository>(CUSTOMER_REPOSITORY);
    phoneValidator = module.get<IPhoneNumberValidator>(PHONE_NUMBER_VALIDATOR);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    const customerId = 'some-customer-id';
    const command = new UpdateCustomerCommand(
      customerId,
      'Updated',
      'Name',
      new Date('1995-01-01'),
      '+16502530001',
      'updated.email@example.com',
      'NL91ABNA0417164301',
    );

    const existingCustomer = Customer.create({
      id: customerId,
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: new Date('1990-01-01'),
      phoneNumber: '+16502530000',
      email: 'john.doe@example.com',
      bankAccountNumber: 'NL91ABNA0417164300',
    });

    const updatedCustomer = Customer.create({
      id: customerId,
      firstName: 'Updated',
      lastName: 'Name',
      dateOfBirth: new Date('1995-01-01'),
      phoneNumber: '+16502530001',
      email: 'updated.email@example.com',
      bankAccountNumber: 'NL91ABNA0417164301',
    });

    it('should update a customer successfully', async () => {
      const phoneInfo: IPhoneNumberInfo = {
        isValid: true,
        isMobile: true,
        e164Format: '+16502530001',
      };
      phoneValidator.validate = jest.fn().mockResolvedValue(phoneInfo);
      customerRepository.findByEmail = jest.fn().mockResolvedValue(null);
      customerRepository.findByUniqueness = jest.fn().mockResolvedValue(null);
      customerRepository.findById = jest
        .fn()
        .mockResolvedValue(existingCustomer);
      customerRepository.save = jest.fn().mockResolvedValue(updatedCustomer);

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
      expect(customerRepository.findById).toHaveBeenCalledWith(customerId);
      expect(customerRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: command.id,
          firstName: command.firstName,
          lastName: command.lastName,
          dateOfBirth: command.dateOfBirth,
          phoneNumber: expect.objectContaining({ value: command.phoneNumber }),
          email: expect.objectContaining({ value: command.email }),
          bankAccountNumber: command.bankAccountNumber,
        }),
      );
      expect(result).toEqual(updatedCustomer);
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

    it('should update the customer when the email is not changed', async () => {
      const updateCommand = new UpdateCustomerCommand(
        customerId,
        'Updated',
        'Name',
        new Date('1995-01-01'),
        '+16502530001',
        'john.doe@example.com', // Same email
        'NL91ABNA0417164301',
      );
      const phoneInfo: IPhoneNumberInfo = {
        isValid: true,
        isMobile: true,
        e164Format: '+16502530001',
      };
      phoneValidator.validate = jest.fn().mockResolvedValue(phoneInfo);
      customerRepository.findByEmail = jest
        .fn()
        .mockResolvedValue(existingCustomer);
      customerRepository.findByUniqueness = jest.fn().mockResolvedValue(null);
      customerRepository.findById = jest
        .fn()
        .mockResolvedValue(existingCustomer);
      customerRepository.save = jest.fn().mockResolvedValue(updatedCustomer);

      const result = await handler.execute(updateCommand);

      expect(result).toEqual(updatedCustomer);
    });

    it('should update the customer when the uniqueness is not changed', async () => {
      const updateCommand = new UpdateCustomerCommand(
        customerId,
        'John', // Same first name
        'Doe', // Same last name
        new Date('1990-01-01'), // Same date of birth
        '+16502530001',
        'updated.email@example.com',
        'NL91ABNA0417164301',
      );
      const phoneInfo: IPhoneNumberInfo = {
        isValid: true,
        isMobile: true,
        e164Format: '+16502530001',
      };
      phoneValidator.validate = jest.fn().mockResolvedValue(phoneInfo);
      customerRepository.findByEmail = jest.fn().mockResolvedValue(null);
      customerRepository.findByUniqueness = jest
        .fn()
        .mockResolvedValue(existingCustomer);
      customerRepository.findById = jest
        .fn()
        .mockResolvedValue(existingCustomer);
      customerRepository.save = jest.fn().mockResolvedValue(updatedCustomer);

      const result = await handler.execute(updateCommand);

      expect(result).toEqual(updatedCustomer);
    });
  });
});
