import { Test, TestingModule } from '@nestjs/testing';
import { EventBus } from '@nestjs/cqrs';
import { DeleteCustomerHandler } from './delete-customer.handler';
import { DeleteCustomerCommand } from '../impl/delete-customer.command';
import {
  ICustomerRepository,
  CUSTOMER_REPOSITORY,
} from '../../../core/repositories/customer.repository.interface';
import { PHONE_NUMBER_VALIDATOR } from '../../interfaces/phone-validator.interface';

const mockCustomerRepository = {
  delete: jest.fn(),
};

const mockPhoneValidator = {
  validate: jest.fn(),
};

const mockEventBus = {
  publish: jest.fn(),
};

describe('DeleteCustomerHandler', () => {
  let handler: DeleteCustomerHandler;
  let customerRepository: ICustomerRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteCustomerHandler,
        { provide: CUSTOMER_REPOSITORY, useValue: mockCustomerRepository },
        { provide: PHONE_NUMBER_VALIDATOR, useValue: mockPhoneValidator },
        { provide: EventBus, useValue: mockEventBus },
      ],
    }).compile();

    handler = module.get<DeleteCustomerHandler>(DeleteCustomerHandler);
    customerRepository = module.get<ICustomerRepository>(CUSTOMER_REPOSITORY);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    const command = new DeleteCustomerCommand('some-id');

    it('should delete a customer successfully', async () => {
      customerRepository.delete = jest.fn().mockResolvedValue(true);

      const result = await handler.execute(command);

      expect(customerRepository.delete).toHaveBeenCalledWith(command.id);
      expect(result).toBe(true);
    });

    it('should return false if no customer was deleted', async () => {
      customerRepository.delete = jest.fn().mockResolvedValue(false);

      const result = await handler.execute(command);

      expect(customerRepository.delete).toHaveBeenCalledWith(command.id);
      expect(result).toBe(false);
    });

    it('should propagate errors from the repository', async () => {
      const errorMessage = 'Database error occurred';
      customerRepository.delete = jest
        .fn()
        .mockRejectedValue(new Error(errorMessage));

      await expect(handler.execute(command)).rejects.toThrowError(errorMessage);
    });
  });
});
