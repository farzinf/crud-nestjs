import {
  Before,
  Given,
  When,
  Then,
  setDefaultTimeout,
} from '@cucumber/cucumber';
import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as assert from 'assert';

import { AppModule } from '../../../src/app.module';
import { CreateCustomerDto } from '../../../src/application/dtos/create-customer.dto';
import { UpdateCustomerDto } from '../../../src/application/dtos/update-customer.dto';
import { CustomerEntity } from '../../../src/infrastructure/database/entities/customer.entity';

setDefaultTimeout(60 * 1000);

let app: INestApplication;
let response: request.Response;
let existingCustomerId: string;
let createCustomerDto: CreateCustomerDto;
let updateCustomerDto: UpdateCustomerDto;
let customerRepository: Repository<CustomerEntity>;

Before(async () => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleFixture.createNestApplication();
  await app.init();

  customerRepository = moduleFixture.get<Repository<CustomerEntity>>(
    getRepositoryToken(CustomerEntity),
  );
  // mockPhoneValidator = moduleFixture.get(PHONE_NUMBER_VALIDATOR); // Get mock instance if used

  // Clean database before tests run
  await customerRepository.query('DELETE FROM customers;'); // Or use truncate if allowed
});

Given('valid customer data', () => {
  createCustomerDto = {
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: '1990-01-01',
    phoneNumber: '+16502530000',
    email: 'john.doe.cucumber@example.com',
    bankAccountNumber: 'NL91ABNA0417164300',
  };
});

Given('an invalid phone number', () => {
  createCustomerDto = {
    firstName: 'Invalid',
    lastName: 'Phone',
    dateOfBirth: '1990-01-01',
    phoneNumber: 'invalid-phone',
    email: 'invalid.phone.cucumber@example.com',
    bankAccountNumber: 'NL91ABNA0417164300',
  };
});

Given('a customer with email {string} exists', async (email: string) => {
  const existingCustomer: CreateCustomerDto = {
    firstName: 'Duplicate',
    lastName: 'Email',
    dateOfBirth: '1990-01-01',
    phoneNumber: '+16502530001',
    email: email,
    bankAccountNumber: 'NL91ABNA0417164301',
  };
  await request(app.getHttpServer())
    .post('/customers')
    .send(existingCustomer)
    .expect(201);
});

Given('valid customer data with email {string}', async (email: string) => {
  createCustomerDto = {
    firstName: 'Duplicate',
    lastName: 'Email',
    dateOfBirth: '1990-01-01',
    phoneNumber: '+16502530000',
    email: email,
    bankAccountNumber: 'NL91ABNA0417164300',
  };
});

Given('a customer with ID {string} exists', async (customerId: string) => {
  if (customerId === 'existing-customer-id') {
    const existingCustomer: CreateCustomerDto = {
      firstName: 'ToRetrieve',
      lastName: 'Doe',
      dateOfBirth: '1990-01-01',
      phoneNumber: '+16502530000',
      email: 'to.retrieve.cucumber@example.com',
      bankAccountNumber: 'NL91ABNA0417164300',
    };
    const createResponse = await request(app.getHttpServer())
      .post('/customers')
      .send(existingCustomer);
    existingCustomerId = createResponse.body.id;
  } else {
    const existingCustomer: CreateCustomerDto = {
      firstName: 'ToUpdate',
      lastName: 'Doe',
      dateOfBirth: '1990-01-01',
      phoneNumber: '+16502530000',
      email: 'to.update.cucumber@example.com',
      bankAccountNumber: 'NL91ABNA0417164300',
    };
    const createResponse = await request(app.getHttpServer())
      .post('/customers')
      .send(existingCustomer);
    existingCustomerId = createResponse.body.id;
  }
});

Given('that at least {int} customer exists', async (number: number) => {
  for (let i = 0; i < number; i++) {
    const existingCustomer: CreateCustomerDto = {
      firstName: 'ToRetrieve' + i,
      lastName: 'Doe',
      dateOfBirth: '1990-01-01',
      phoneNumber: '+16502530000',
      email: `to.retrieve${i}.cucumber@example.com`,
      bankAccountNumber: 'NL91ABNA0417164300',
    };
    await request(app.getHttpServer())
      .post('/customers')
      .send(existingCustomer)
      .expect(201);
  }
});

Given('valid customer update data', () => {
  updateCustomerDto = {
    firstName: 'Updated',
    lastName: 'Name',
    dateOfBirth: '1995-02-02',
    phoneNumber: '+16502530001',
    email: 'updated.cucumber@example.com',
    bankAccountNumber: 'NL91ABNA0417164301',
  };
});

Given('invalid phone number in update data', () => {
  updateCustomerDto = {
    firstName: 'Updated',
    lastName: 'Name',
    dateOfBirth: '1995-02-02',
    phoneNumber: 'invalid-phone',
    email: 'updated.cucumber@example.com',
    bankAccountNumber: 'NL91ABNA0417164301',
  };
});

When('a customer is created', async () => {
  response = await request(app.getHttpServer())
    .post('/customers')
    .send(createCustomerDto);
});

When(
  'a request is made to retrieve the customer by ID {string}',
  async (customerId: string) => {
    if (customerId === 'existing-customer-id') {
      response = await request(app.getHttpServer()).get(
        `/customers/${existingCustomerId}`,
      );
    } else {
      response = await request(app.getHttpServer()).get(
        `/customers/${customerId}`,
      );
    }
  },
);

When('a request is made to get all customers', async () => {
  response = await request(app.getHttpServer()).get('/customers');
});

When('the customer {string} is updated', async (customerId: string) => {
  if (customerId === 'existing-customer-id') {
    response = await request(app.getHttpServer())
      .put(`/customers/${existingCustomerId}`)
      .send(updateCustomerDto);
  }
});

When(
  'a request is made to delete the customer {string}',
  async (customerId: string) => {
    if (customerId === 'existing-customer-id') {
      response = await request(app.getHttpServer()).delete(
        `/customers/${existingCustomerId}`,
      );
    }
  },
);

When(
  'a request is made to retrieve a customer with ID {string}',
  async (customerId: string) => {
    if (customerId === 'invalid-customer-id') {
      response = await request(app.getHttpServer()).get(
        `/customers/604a8529-286c-4dfa-827b-fde66128d6a8`,
      );
    }
  },
);

Then('the customer should be stored', () => {
  assert.strictEqual(response.status, 201);
  assert.ok(response.body.hasOwnProperty('id'));
  assert.strictEqual(response.body.firstName, createCustomerDto.firstName);
});

Then('an error should be returned', () => {
  assert.strictEqual(response.status, 400);
  assert.ok(response.body.message[0].includes('PhoneNumber must be'));
});

Then('an error indicating a duplicate email should be returned', () => {
  assert.strictEqual(response.status, 409);
  assert.ok(response.body.message.includes('already exists'));
});

Then('the customer details should be returned', () => {
  assert.strictEqual(response.status, 200);
  assert.strictEqual(response.body.id, existingCustomerId);
});

Then('a not found error should be returned', () => {
  assert.strictEqual(response.status, 404);
  assert.ok(response.body.message.includes('not found'));
});

Then('all customers should be returned', () => {
  assert.strictEqual(response.status, 200);
  assert.ok(response.body.length >= 2);
});

Then('the customer information should be updated', () => {
  assert.strictEqual(response.status, 200);
  assert.strictEqual(response.body.id, existingCustomerId);
  assert.strictEqual(response.body.firstName, updateCustomerDto.firstName);
  assert.strictEqual(response.body.lastName, updateCustomerDto.lastName);
  assert.ok(response.body.dateOfBirth.includes(updateCustomerDto.dateOfBirth));
  assert.strictEqual(response.body.phoneNumber, updateCustomerDto.phoneNumber);
  assert.strictEqual(response.body.email, updateCustomerDto.email);
  assert.strictEqual(
    response.body.bankAccountNumber,
    updateCustomerDto.bankAccountNumber,
  );
});

Then('an error indicating invalid phone number should be returned', () => {
  assert.strictEqual(response.status, 400);
  assert.ok(response.body.message[0].includes('PhoneNumber must'));
});

Then('the customer should be removed', async () => {
  const check = await request(app.getHttpServer())
    .get(`/customers/${existingCustomerId}`)
    .expect(404);
  assert.strictEqual(check.status, 404);
  assert.ok(check.body.message.includes('not found'));
});
