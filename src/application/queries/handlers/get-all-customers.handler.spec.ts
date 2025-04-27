import { Test, TestingModule } from '@nestjs/testing';
import { GetAllCustomersHandler } from './get-all-customers.handler';
import { GetAllCustomersQuery } from '../impl/get-all-customers.query';
import {
  ICustomerRepository,
  CUSTOMER_REPOSITORY,
} from '../../../core/repositories/customer.repository.interface';
import { Customer } from '../../../core/aggregates/customer.aggregate';

// Mock the CustomerRepository
const mockCustomerRepository = {
  findAll: jest.fn(),
};

describe('GetAllCustomersHandler', () => {
  let handler: GetAllCustomersHandler;
  let customerRepository: ICustomerRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetAllCustomersHandler,
        { provide: CUSTOMER_REPOSITORY, useValue: mockCustomerRepository },
      ],
    }).compile();

    handler = module.get<GetAllCustomersHandler>(GetAllCustomersHandler);
    customerRepository = module.get<ICustomerRepository>(CUSTOMER_REPOSITORY);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should return all customers', async () => {
      const mockCustomers = [
        Customer.create({
          firstName: 'John',
          lastName: 'Doe',
          dateOfBirth: new Date('1990-01-01'),
          phoneNumber: '+16502530000',
          email: 'john.doe@example.com',
          bankAccountNumber: 'NL91ABNA0417164300',
        }),
        Customer.create({
          firstName: 'Jane',
          lastName: 'Smith',
          dateOfBirth: new Date('1995-02-02'),
          phoneNumber: '+16502530001',
          email: 'jane.smith@example.com',
          bankAccountNumber: 'NL91ABNA0417164301',
        }),
      ];

      customerRepository.findAll = jest.fn().mockResolvedValue(mockCustomers);

      const query = new GetAllCustomersQuery(); // This query is empty, no params
      const result = await handler.execute(query); // No need to pass command, handler is for queries

      expect(customerRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockCustomers);
    });
    it('should return an empty array if no customers are found', async () => {
      customerRepository.findAll = jest.fn().mockResolvedValue([]);

      const query = new GetAllCustomersQuery();
      const result = await handler.execute(query);

      expect(customerRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should propagate errors from the repository', async () => {
      const errorMessage = 'Database error occurred';
      customerRepository.findAll = jest
        .fn()
        .mockRejectedValue(new Error(errorMessage));

      const query = new GetAllCustomersQuery();
      await expect(handler.execute(query)).rejects.toThrowError(errorMessage);
    });
  });
});
