import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Repository } from 'typeorm';

import { AppModule } from '../src/app.module';
import { CreateCustomerDto } from '../src/application/dtos/create-customer.dto';
import { UpdateCustomerDto } from '../src/application/dtos/update-customer.dto';
import { CustomerEntity } from '../src/infrastructure/database/entities/customer.entity';

describe('Customer Management (Behavior Tests)', () => {
  let app: INestApplication;
  let customerRepository: Repository<CustomerEntity>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    customerRepository = moduleFixture.get<Repository<CustomerEntity>>(
      getRepositoryToken(CustomerEntity),
    );
    // mockPhoneValidator = moduleFixture.get(PHONE_NUMBER_VALIDATOR); // Get mock instance if used

    await customerRepository.query('DELETE FROM customers;'); // Or use truncate if allowed
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Customer Creation', () => {
    it('Given valid customer data, when a customer is created, then the customer should be stored', async () => {
      // Arrange
      const createCustomerDto: CreateCustomerDto = {
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
        phoneNumber: '+16502530000',
        email: 'john.doe.bdd@example.com',
        bankAccountNumber: 'NL91ABNA0417164300',
      };

      // Act
      const response = await request(app.getHttpServer())
        .post('/customers')
        .send(createCustomerDto)
        .expect(201);

      // Assert
      expect(response.body).toHaveProperty('id');
      expect(response.body.firstName).toEqual(createCustomerDto.firstName);
    });

    it('Given an invalid phone number, when a customer is created, then an error should be returned', async () => {
      const createCustomerDto: CreateCustomerDto = {
        firstName: 'Invalid',
        lastName: 'Phone',
        dateOfBirth: '1990-01-01',
        phoneNumber: 'invalid-phone',
        email: 'invalid.phone.bdd@example.com',
        bankAccountNumber: 'NL91ABNA0417164300',
      };

      const response = await request(app.getHttpServer())
        .post('/customers')
        .send(createCustomerDto)
        .expect(400);

      expect(response.body.message[0]).toContain(
        'PhoneNumber must be in E.164 format (e.g., +16502530000)',
      );
    });

    it('Given a duplicate email, when a customer is created, then an error should be returned', async () => {
      const createCustomerDto: CreateCustomerDto = {
        firstName: 'Duplicate',
        lastName: 'Email',
        dateOfBirth: '1990-01-01',
        phoneNumber: '+16502530000',
        email: 'duplicate.email.bdd@example.com',
        bankAccountNumber: 'NL91ABNA0417164300',
      };
      await request(app.getHttpServer())
        .post('/customers')
        .send(createCustomerDto)
        .expect(201);
      const response = await request(app.getHttpServer())
        .post('/customers')
        .send(createCustomerDto)
        .expect(409); // Or another error status

      expect(response.body.message).toContain('already exists');
    });

    it('Given a duplicate uniqueness key, when a customer is created, then an error should be returned', async () => {
      const createCustomerDto: CreateCustomerDto = {
        firstName: 'Unique',
        lastName: 'Person',
        dateOfBirth: '1990-01-01',
        phoneNumber: '+16502530000',
        email: 'unique.person1.bdd@example.com',
        bankAccountNumber: 'NL91ABNA0417164300',
      };
      const createCustomerDto2: CreateCustomerDto = {
        firstName: 'Unique',
        lastName: 'Person',
        dateOfBirth: '1990-01-01',
        phoneNumber: '+16502530001',
        email: 'unique.person2.bdd@example.com',
        bankAccountNumber: 'NL91ABNA0417164301',
      };
      await request(app.getHttpServer())
        .post('/customers')
        .send(createCustomerDto)
        .expect(201);
      const response = await request(app.getHttpServer())
        .post('/customers')
        .send(createCustomerDto2)
        .expect(409); // Or another error status

      expect(response.body.message).toContain('already exists');
    });
  });

  describe('Customer Retrieval', () => {
    it('Given a customer ID, when a customer is requested, then the customer details should be returned', async () => {
      const createCustomerDto: CreateCustomerDto = {
        firstName: 'ToRetrieve',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
        phoneNumber: '+16502530000',
        email: 'to.retrieve.bdd@example.com',
        bankAccountNumber: 'NL91ABNA0417164300',
      };
      const createResponse = await request(app.getHttpServer())
        .post('/customers')
        .send(createCustomerDto);
      const customerId = createResponse.body.id;

      const response = await request(app.getHttpServer())
        .get(`/customers/${customerId}`)
        .expect(200);

      expect(response.body.id).toEqual(customerId);
      expect(response.body.firstName).toEqual(createCustomerDto.firstName);
    });

    it('Given an invalid customer ID, when a customer is requested, then a not found error should be returned', async () => {
      const response = await request(app.getHttpServer())
        .get('/customers/604a8529-286c-4dfa-827b-fde66128d6a8')
        .expect(404);

      expect(response.body.message.includes('not found')).toBeTruthy();
    });

    it('Given no params, when all customer are requested, then all customers should be returned', async () => {
      const createCustomerDto: CreateCustomerDto = {
        firstName: 'ToRetrieve1',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
        phoneNumber: '+16502530000',
        email: 'to.retrieve1.bdd@example.com',
        bankAccountNumber: 'NL91ABNA0417164300',
      };
      const createCustomerDto2: CreateCustomerDto = {
        firstName: 'ToRetrieve2',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
        phoneNumber: '+16502530000',
        email: 'to.retrieve2.bdd@example.com',
        bankAccountNumber: 'NL91ABNA0417164300',
      };
      await request(app.getHttpServer())
        .post('/customers')
        .send(createCustomerDto);
      await request(app.getHttpServer())
        .post('/customers')
        .send(createCustomerDto2);
      const response = await request(app.getHttpServer())
        .get(`/customers`)
        .expect(200);

      expect(response.body.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Customer Update', () => {
    it('Given valid customer data, when a customer is updated, then the customer information should be updated', async () => {
      const createCustomerDto: CreateCustomerDto = {
        firstName: 'ToUpdate',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
        phoneNumber: '+16502530000',
        email: 'to.update.bdd@example.com',
        bankAccountNumber: 'NL91ABNA0417164300',
      };
      const createResponse = await request(app.getHttpServer())
        .post('/customers')
        .send(createCustomerDto);
      const customerId = createResponse.body.id;

      const updateCustomerDto: UpdateCustomerDto = {
        firstName: 'Updated',
        lastName: 'Name',
        dateOfBirth: '1995-02-02',
        phoneNumber: '+16502530001',
        email: 'updated.bdd@example.com',
        bankAccountNumber: 'NL91ABNA0417164301',
      };
      const response = await request(app.getHttpServer())
        .put(`/customers/${customerId}`)
        .send(updateCustomerDto)
        .expect(200);

      expect(response.body.id).toEqual(customerId);
      expect(response.body.firstName).toEqual(updateCustomerDto.firstName);
      expect(response.body.lastName).toEqual(updateCustomerDto.lastName);
      expect(
        response.body.dateOfBirth.includes(updateCustomerDto.dateOfBirth),
      ).toBeTruthy();
      expect(response.body.phoneNumber).toEqual(updateCustomerDto.phoneNumber);
      expect(response.body.email).toEqual(updateCustomerDto.email);
      expect(response.body.bankAccountNumber).toEqual(
        updateCustomerDto.bankAccountNumber,
      );
    });

    it('Given an invalid phone number, when a customer is updated, then an error should be returned', async () => {
      const createCustomerDto: CreateCustomerDto = {
        firstName: 'InvalidPhone',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
        phoneNumber: '+16502530000',
        email: 'invalid.phone.update.bdd@example.com',
        bankAccountNumber: 'NL91ABNA0417164300',
      };
      const createResponse = await request(app.getHttpServer())
        .post('/customers')
        .send(createCustomerDto);
      const customerId = createResponse.body.id;

      const updateCustomerDto: UpdateCustomerDto = {
        firstName: 'Updated',
        lastName: 'Name',
        dateOfBirth: '1995-02-02',
        phoneNumber: 'invalid-phone',
        email: 'updated.bdd@example.com',
        bankAccountNumber: 'NL91ABNA0417164301',
      };
      const response = await request(app.getHttpServer())
        .put(`/customers/${customerId}`)
        .send(updateCustomerDto)
        .expect(400); // Or another error status

      expect(response.body.message[0]).toContain('PhoneNumber must be');
    });
  });

  describe('Customer Deletion', () => {
    it('Given a customer ID, when a customer is deleted, then the customer should be removed', async () => {
      const createCustomerDto: CreateCustomerDto = {
        firstName: 'ToDelete',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
        phoneNumber: '+16502530000',
        email: 'to.delete.bdd@example.com',
        bankAccountNumber: 'NL91ABNA0417164300',
      };
      const createResponse = await request(app.getHttpServer())
        .post('/customers')
        .send(createCustomerDto);
      const customerId = createResponse.body.id;

      await request(app.getHttpServer())
        .delete(`/customers/${customerId}`)
        .expect(204);
      await request(app.getHttpServer())
        .get(`/customers/${customerId}`)
        .expect(404);
    });
  });
});
