import { Test, TestingModule } from '@nestjs/testing';
import { GetCustomerByIdHandler } from './get-customer-by-id.handler';
import { GetCustomerByIdQuery } from '../impl/get-customer-by-id.query';
import {
  ICustomerRepository,
  CUSTOMER_REPOSITORY,
} from '../../../core/repositories/customer.repository.interface';
import { Customer } from '../../../core/aggregates/customer.aggregate';
import { NotFoundException } from '@nestjs/common';

// Mock the CustomerRepository
const mockCustomerRepository = {
  findById: jest.fn(),
};

describe('GetCustomerByIdHandler', () => {
  let handler: GetCustomerByIdHandler;
  let customerRepository: ICustomerRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetCustomerByIdHandler,
        { provide: CUSTOMER_REPOSITORY, useValue: mockCustomerRepository },
      ],
    }).compile();

    handler = module.get<GetCustomerByIdHandler>(GetCustomerByIdHandler);
    customerRepository = module.get<ICustomerRepository>(CUSTOMER_REPOSITORY);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should return a customer by id', async () => {
      const mockCustomer = Customer.create({
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: new Date('1990-01-01'),
        phoneNumber: '+16502530000',
        email: 'john.doe@example.com',
        bankAccountNumber: 'NL91ABNA0417164300',
      });
      customerRepository.findById = jest.fn().mockResolvedValue(mockCustomer);

      const query = new GetCustomerByIdQuery('some-id');
      const result = await handler.execute(query);

      expect(customerRepository.findById).toHaveBeenCalledWith('some-id');
      expect(result).toEqual(mockCustomer);
    });

    it('should throw NotFoundException if customer is not found', async () => {
      customerRepository.findById = jest.fn().mockResolvedValue(null);

      const query = new GetCustomerByIdQuery('some-id');
      await expect(handler.execute(query)).rejects.toThrow(NotFoundException);
      expect(customerRepository.findById).toHaveBeenCalledWith('some-id');
    });
    it('should propagate errors from the repository', async () => {
      const errorMessage = 'Database error occurred';
      customerRepository.findById = jest
        .fn()
        .mockRejectedValue(new Error(errorMessage));

      const query = new GetCustomerByIdQuery('some-id');
      await expect(handler.execute(query)).rejects.toThrowError(errorMessage);
    });
  });
});
