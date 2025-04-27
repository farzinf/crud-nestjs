import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerRepository } from './customer.repository';
import { CustomerEntity } from '../entities/customer.entity';
import { Customer, Email } from '../../../core/aggregates/customer.aggregate';
import { NotFoundException } from '@nestjs/common';

// Mock the typeORM repository
type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
const createMockRepository = <T = any>(): MockRepository<T> => ({
  findOneBy: jest.fn(),
  find: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});

describe('CustomerRepository', () => {
  let customerRepository: CustomerRepository;
  let ormRepositoryMock: MockRepository<CustomerEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerRepository,
        {
          provide: getRepositoryToken(CustomerEntity),
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    customerRepository = module.get<CustomerRepository>(CustomerRepository);
    ormRepositoryMock = module.get<MockRepository<CustomerEntity>>(
      getRepositoryToken(CustomerEntity),
    );
  });

  it('should be defined', () => {
    expect(customerRepository).toBeDefined();
  });

  describe('save', () => {
    it('should save a customer and return the customer', async () => {
      const customer = Customer.create({
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: new Date('1990-01-01'),
        phoneNumber: '+16502530000',
        email: 'john.doe@example.com',
        bankAccountNumber: 'NL91ABNA0417164300',
      });
      const entity = new CustomerEntity();
      entity.id = customer.id;
      entity.firstName = customer.firstName;
      entity.lastName = customer.lastName;
      entity.dateOfBirth = customer.dateOfBirth.toISOString().split('T')[0];
      entity.phoneNumber = customer.phoneNumber.value;
      entity.email = customer.email.value;
      entity.bankAccountNumber = customer.bankAccountNumber;

      ormRepositoryMock.save.mockResolvedValue(entity);

      const result = await customerRepository.save(customer);
      expect(ormRepositoryMock.save).toHaveBeenCalledWith(entity);
      expect(result).toBeInstanceOf(Customer);
      expect(result.id).toEqual(customer.id);
      expect(result.firstName).toEqual(customer.firstName);
    });
  });

  describe('update', () => {
    it('should update a customer and return the updated customer', async () => {
      const customer = Customer.create({
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: new Date('1990-01-01'),
        phoneNumber: '+16502530000',
        email: 'john.doe@example.com',
        bankAccountNumber: 'NL91ABNA0417164300',
      });

      const entity = new CustomerEntity();
      entity.id = customer.id;
      entity.firstName = customer.firstName;
      entity.lastName = customer.lastName;
      entity.dateOfBirth = customer.dateOfBirth.toISOString().split('T')[0];
      entity.phoneNumber = customer.phoneNumber.value;
      entity.email = customer.email.value;
      entity.bankAccountNumber = customer.bankAccountNumber;

      ormRepositoryMock.findOneBy.mockResolvedValue(entity);
      ormRepositoryMock.save.mockResolvedValue(entity);

      const result = await customerRepository.update(customer);
      expect(ormRepositoryMock.findOneBy).toHaveBeenCalledWith({
        id: customer.id,
      });
      expect(ormRepositoryMock.save).toHaveBeenCalledWith(entity);
      expect(result).toBeInstanceOf(Customer);
      expect(result.id).toEqual(customer.id);
      expect(result.firstName).toEqual(customer.firstName);
    });

    it('should throw NotFoundException if customer is not found', async () => {
      const customer = Customer.create({
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: new Date('1990-01-01'),
        phoneNumber: '+16502530000',
        email: 'john.doe@example.com',
        bankAccountNumber: 'NL91ABNA0417164300',
      });

      ormRepositoryMock.findOneBy.mockResolvedValue(null);
      await expect(customerRepository.update(customer)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findById', () => {
    it('should find a customer by id', async () => {
      const customer = Customer.create({
        id: 'some-id',
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: new Date('1990-01-01'),
        phoneNumber: '+16502530000',
        email: 'john.doe@example.com',
        bankAccountNumber: 'NL91ABNA0417164300',
      });
      const entity = new CustomerEntity();
      entity.id = customer.id;
      entity.firstName = customer.firstName;
      entity.lastName = customer.lastName;
      entity.dateOfBirth = customer.dateOfBirth.toISOString().split('T')[0];
      entity.phoneNumber = customer.phoneNumber.value;
      entity.email = customer.email.value;
      entity.bankAccountNumber = customer.bankAccountNumber;
      ormRepositoryMock.findOneBy.mockResolvedValue(entity);

      const result = await customerRepository.findById('some-id');
      expect(ormRepositoryMock.findOneBy).toHaveBeenCalledWith({
        id: 'some-id',
      });
      expect(result).toBeInstanceOf(Customer);
      expect(result.id).toEqual(customer.id);
      expect(result.firstName).toEqual(customer.firstName);
    });

    it('should return null if customer is not found', async () => {
      ormRepositoryMock.findOneBy.mockResolvedValue(null);

      const result = await customerRepository.findById('some-id');
      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should find all customers', async () => {
      const customer1 = Customer.create({
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: new Date('1990-01-01'),
        phoneNumber: '+16502530000',
        email: 'john.doe@example.com',
        bankAccountNumber: 'NL91ABNA0417164300',
      });
      const customer2 = Customer.create({
        firstName: 'Jane',
        lastName: 'Smith',
        dateOfBirth: new Date('1995-02-02'),
        phoneNumber: '+16502530001',
        email: 'jane.smith@example.com',
        bankAccountNumber: 'NL91ABNA0417164301',
      });
      const entity1 = new CustomerEntity();
      entity1.id = customer1.id;
      entity1.firstName = customer1.firstName;
      entity1.lastName = customer1.lastName;
      entity1.dateOfBirth = customer1.dateOfBirth.toISOString().split('T')[0];
      entity1.phoneNumber = customer1.phoneNumber.value;
      entity1.email = customer1.email.value;
      entity1.bankAccountNumber = customer1.bankAccountNumber;

      const entity2 = new CustomerEntity();
      entity2.id = customer2.id;
      entity2.firstName = customer2.firstName;
      entity2.lastName = customer2.lastName;
      entity2.dateOfBirth = customer2.dateOfBirth.toISOString().split('T')[0];
      entity2.phoneNumber = customer2.phoneNumber.value;
      entity2.email = customer2.email.value;
      entity2.bankAccountNumber = customer2.bankAccountNumber;

      ormRepositoryMock.find.mockResolvedValue([entity1, entity2]);

      const result = await customerRepository.findAll();
      expect(ormRepositoryMock.find).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Customer);
      expect(result[1]).toBeInstanceOf(Customer);
    });

    it('should return empty array if no customer is found', async () => {
      ormRepositoryMock.find.mockResolvedValue([]);
      const result = await customerRepository.findAll();
      expect(result).toEqual([]);
    });
  });

  describe('findByEmail', () => {
    it('should find a customer by email', async () => {
      const customer = Customer.create({
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: new Date('1990-01-01'),
        phoneNumber: '+16502530000',
        email: 'john.doe@example.com',
        bankAccountNumber: 'NL91ABNA0417164300',
      });
      const entity = new CustomerEntity();
      entity.id = customer.id;
      entity.firstName = customer.firstName;
      entity.lastName = customer.lastName;
      entity.dateOfBirth = customer.dateOfBirth.toISOString().split('T')[0];
      entity.phoneNumber = customer.phoneNumber.value;
      entity.email = customer.email.value;
      entity.bankAccountNumber = customer.bankAccountNumber;
      ormRepositoryMock.findOneBy.mockResolvedValue(entity);
      const email = new Email('john.doe@example.com');
      const result = await customerRepository.findByEmail(email);
      expect(ormRepositoryMock.findOneBy).toHaveBeenCalledWith({
        email: 'john.doe@example.com',
      });
      expect(result).toBeInstanceOf(Customer);
      expect(result.id).toEqual(customer.id);
      expect(result.email.value).toEqual(email.value);
    });

    it('should return null if customer is not found', async () => {
      ormRepositoryMock.findOneBy.mockResolvedValue(null);
      const email = new Email('john.doe@example.com');
      const result = await customerRepository.findByEmail(email);
      expect(result).toBeNull();
    });
  });

  describe('findByUniqueness', () => {
    it('should find a customer by uniqueness', async () => {
      const customer = Customer.create({
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: new Date('1990-01-01'),
        phoneNumber: '+16502530000',
        email: 'john.doe@example.com',
        bankAccountNumber: 'NL91ABNA0417164300',
      });
      const entity = new CustomerEntity();
      entity.id = customer.id;
      entity.firstName = customer.firstName;
      entity.lastName = customer.lastName;
      entity.dateOfBirth = customer.dateOfBirth.toISOString().split('T')[0];
      entity.phoneNumber = customer.phoneNumber.value;
      entity.email = customer.email.value;
      entity.bankAccountNumber = customer.bankAccountNumber;

      ormRepositoryMock.findOneBy.mockResolvedValue(entity);
      const dateOfBirth = new Date('1990-01-01');
      const result = await customerRepository.findByUniqueness(
        'John',
        'Doe',
        dateOfBirth,
      );
      expect(ormRepositoryMock.findOneBy).toHaveBeenCalledWith({
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
      });
      expect(result).toBeInstanceOf(Customer);
      expect(result.id).toEqual(customer.id);
      expect(result.firstName).toEqual(customer.firstName);
    });

    it('should return null if customer is not found', async () => {
      ormRepositoryMock.findOneBy.mockResolvedValue(null);
      const dateOfBirth = new Date('1990-01-01');
      const result = await customerRepository.findByUniqueness(
        'John',
        'Doe',
        dateOfBirth,
      );
      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete a customer', async () => {
      ormRepositoryMock.delete.mockResolvedValue({ affected: 1 });
      const result = await customerRepository.delete('some-id');
      expect(ormRepositoryMock.delete).toHaveBeenCalledWith('some-id');
      expect(result).toBeTruthy();
    });

    it('should return false if no customer is deleted', async () => {
      ormRepositoryMock.delete.mockResolvedValue({ affected: 0 });
      const result = await customerRepository.delete('some-id');
      expect(result).toBeFalsy();
    });
  });
});
