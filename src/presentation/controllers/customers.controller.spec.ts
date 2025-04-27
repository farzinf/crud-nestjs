import { Test, TestingModule } from '@nestjs/testing';
import { CustomersController } from './customers.controller';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateCustomerCommand } from '../../application/commands/impl/create-customer.command';
import { GetCustomerByIdQuery } from '../../application/queries/impl/get-customer-by-id.query';
import { GetAllCustomersQuery } from '../../application/queries/impl/get-all-customers.query';
import { DeleteCustomerCommand } from '../../application/commands/impl/delete-customer.command';
import { UpdateCustomerCommand } from '../../application/commands/impl/update-customer.command';
import { CreateCustomerDto } from '../../application/dtos/create-customer.dto';
import { UpdateCustomerDto } from '../../application/dtos/update-customer.dto';
import { CustomerDto } from '../../application/dtos/customer.dto';
import { Customer } from '../../core/aggregates/customer.aggregate';
import { NotFoundException } from '@nestjs/common';

// Mock CommandBus and QueryBus
const mockCommandBus = {
  execute: jest.fn(),
};

const mockQueryBus = {
  execute: jest.fn(),
};

describe('CustomersController', () => {
  let controller: CustomersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomersController],
      providers: [
        { provide: CommandBus, useValue: mockCommandBus },
        { provide: QueryBus, useValue: mockQueryBus },
      ],
    }).compile();

    controller = module.get<CustomersController>(CustomersController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a customer', async () => {
      const createCustomerDto: CreateCustomerDto = {
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
        phoneNumber: '+16502530000',
        email: 'john.doe@example.com',
        bankAccountNumber: 'NL91ABNA0417164300',
      };
      const mockCustomer = Customer.create({
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: new Date('1990-01-01'),
        phoneNumber: '+16502530000',
        email: 'john.doe@example.com',
        bankAccountNumber: 'NL91ABNA0417164300',
      });

      mockCommandBus.execute.mockResolvedValue(mockCustomer);

      const result = await controller.create(createCustomerDto);
      expect(mockCommandBus.execute).toHaveBeenCalledWith(
        expect.any(CreateCustomerCommand),
      );
      expect(result).toBeInstanceOf(CustomerDto);
      expect(result.firstName).toEqual(createCustomerDto.firstName);
    });
  });

  describe('findAll', () => {
    it('should find all customers', async () => {
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
          lastName: 'Doe',
          dateOfBirth: new Date('1995-02-02'),
          phoneNumber: '+16502530001',
          email: 'jane.doe@example.com',
          bankAccountNumber: 'NL91ABNA0417164301',
        }),
      ];
      mockQueryBus.execute.mockResolvedValue(mockCustomers);

      const result = await controller.findAll();

      expect(mockQueryBus.execute).toHaveBeenCalledWith(
        expect.any(GetAllCustomersQuery),
      );
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(CustomerDto);
    });
  });

  describe('findOne', () => {
    it('should find a customer by id', async () => {
      const mockCustomer = Customer.create({
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: new Date('1990-01-01'),
        phoneNumber: '+16502530000',
        email: 'john.doe@example.com',
        bankAccountNumber: 'NL91ABNA0417164300',
      });
      mockQueryBus.execute.mockResolvedValue(mockCustomer);

      const result = await controller.findOne('some-id');

      expect(mockQueryBus.execute).toHaveBeenCalledWith(
        expect.any(GetCustomerByIdQuery),
      );
      expect(result).toBeInstanceOf(CustomerDto);
      expect(result.firstName).toEqual(mockCustomer.firstName);
    });
    it('should throw an error when customer with given id not found', async () => {
      mockQueryBus.execute.mockRejectedValue(new NotFoundException());
      await expect(controller.findOne('some-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a customer', async () => {
      const updateCustomerDto: UpdateCustomerDto = {
        firstName: 'Updated',
        lastName: 'Name',
        dateOfBirth: '1995-02-02',
        phoneNumber: '+16502530001',
        email: 'updated.email@example.com',
        bankAccountNumber: 'NL91ABNA0417164301',
      };
      const mockCustomer = Customer.create({
        firstName: 'Updated',
        lastName: 'Name',
        dateOfBirth: new Date('1995-02-02'),
        phoneNumber: '+16502530001',
        email: 'updated.email@example.com',
        bankAccountNumber: 'NL91ABNA0417164301',
      });

      mockCommandBus.execute.mockResolvedValue(mockCustomer);
      const result = await controller.update('some-id', updateCustomerDto);

      expect(mockCommandBus.execute).toHaveBeenCalledWith(
        expect.any(UpdateCustomerCommand),
      );
      expect(result).toBeInstanceOf(CustomerDto);
      expect(result.firstName).toEqual(updateCustomerDto.firstName);
    });
  });

  describe('remove', () => {
    it('should delete a customer', async () => {
      mockCommandBus.execute.mockResolvedValue(undefined);
      await controller.remove('some-id');

      expect(mockCommandBus.execute).toHaveBeenCalledWith(
        expect.any(DeleteCustomerCommand),
      );
    });
  });
});
