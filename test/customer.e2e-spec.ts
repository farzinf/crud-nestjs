import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
// import { ConfigService } from '@nestjs/config';
// import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerEntity } from '../src/infrastructure/database/entities/customer.entity';
import { CreateCustomerDto } from '../src/application/dtos/create-customer.dto';
// Mock the phone validator if needed for controlled tests
// import { PHONE_NUMBER_VALIDATOR, IPhoneNumberValidator } from '../src/application/interfaces/phone-validator.interface';

describe('CustomersController (e2e)', () => {
  let app: INestApplication;
  let customerRepository: Repository<CustomerEntity>;
  // let mockPhoneValidator: IPhoneNumberValidator;

  beforeAll(async () => {
    // Mock validator implementation
    // const mockValidatorProvider = {
    //   provide: PHONE_NUMBER_VALIDATOR,
    //   useValue: {
    //       validate: jest.fn().mockResolvedValue({ isValid: true, isMobile: true, e164Format: '+16502530000' })
    //   },
    // };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      // .overrideProvider(PHONE_NUMBER_VALIDATOR) // Override if mock needed
      // .useValue(mockPhoneValidator)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        /* ... options from main.ts */
      }),
    );
    await app.init();

    customerRepository = moduleFixture.get<Repository<CustomerEntity>>(
      getRepositoryToken(CustomerEntity),
    );
    // mockPhoneValidator = moduleFixture.get(PHONE_NUMBER_VALIDATOR); // Get mock instance if used

    // Clean database before tests run
    await customerRepository.query('DELETE FROM customers;'); // Or use truncate if allowed
  });

  afterAll(async () => {
    await customerRepository.query('DELETE FROM customers;');
    await app.close();
  });

  beforeEach(async () => {
    // Clean before each test if necessary, depends on test isolation strategy
    await customerRepository.query('DELETE FROM customers;');
  });

  describe('/customers (POST)', () => {
    it('should create a customer successfully', async () => {
      const createDto: CreateCustomerDto = {
        firstName: 'E2E',
        lastName: 'Tester',
        dateOfBirth: '1995-02-20',
        phoneNumber: '+16502530001', // Use a valid mobile number
        email: 'e2e.tester@example.com',
        bankAccountNumber: 'NL91ABNA0417164300',
      };

      // If using mock validator: jest.spyOn(mockPhoneValidator, 'validate').mockResolvedValueOnce({ isValid: true, isMobile: true, e164Format: createDto.phoneNumber });

      const response = await request(app.getHttpServer())
        .post('/customers')
        .send(createDto)
        .expect(HttpStatus.CREATED);

      expect(response.body).toBeDefined();
      expect(response.body.id).toBeDefined();
      expect(response.body.firstName).toEqual(createDto.firstName);
      expect(response.body.email).toEqual(createDto.email);
      expect(response.body.phoneNumber).toEqual(createDto.phoneNumber);

      // Verify in DB
      const dbCustomer = await customerRepository.findOneBy({
        email: createDto.email,
      });
      expect(dbCustomer).toBeDefined();
      expect(dbCustomer.id).toEqual(response.body.id);
    });

    it('should return 400 for invalid phone number format (E.164)', async () => {
      const createDto: CreateCustomerDto = {
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-05-10',
        phoneNumber: '12345',
        email: 'john.doe@example.com',
        bankAccountNumber: 'NL91ABNA0417164307',
      };
      await request(app.getHttpServer())
        .post('/customers')
        .send(createDto)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 for non-mobile phone number (requires validator logic)', async () => {
      const createDto: CreateCustomerDto = {
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-05-10',
        phoneNumber: '+18005551212',
        email: 'john.doe@example.com',
        bankAccountNumber: 'NL91ABNA0417164307',
      }; // Example non-mobile

      // Need to mock the validator for this specific test case if not using a real non-mobile number that the lib detects
      // jest.spyOn(mockPhoneValidator, 'validate').mockResolvedValueOnce({ isValid: true, isMobile: false });

      await request(app.getHttpServer())
        .post('/customers')
        .send(createDto)
        .expect(HttpStatus.BAD_REQUEST) // Or a more specific error code if you map exceptions
        .then((response) => {
          // Check error message if specific exception is mapped
          // expect(response.body.message).toContain('not a mobile number');
        });
      // Reset mock if needed: jest.restoreAllMocks();
    });

    it('should return 409 for duplicate email', async () => {
      const createDto: CreateCustomerDto = {
        // /* ... */ email: 'duplicate@example.com' /* ... */,
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-05-10',
        phoneNumber: '+16502530000',
        email: 'duplicate@example.com',
        bankAccountNumber: 'NL91ABNA0417164307',
      };

      await request(app.getHttpServer())
        .post('/customers')
        .send(createDto)
        .expect(HttpStatus.CREATED);

      await request(app.getHttpServer())
        .post('/customers')
        .send({ ...createDto, firstName: 'Another' }) // Same email, different name
        .expect(HttpStatus.CONFLICT);
    });

    it('should return 409 for duplicate FirstName + LastName + DateOfBirth', async () => {
      const createDto: CreateCustomerDto = {
        firstName: 'Duplicate',
        lastName: 'Name',
        dateOfBirth: '2000-01-01',
        phoneNumber: '+16502530002',
        email: 'unique1@example.com',
        bankAccountNumber: 'NL91ABNA0417164307',
      };
      await request(app.getHttpServer())
        .post('/customers')
        .send(createDto)
        .expect(HttpStatus.CREATED);

      const duplicateDto: CreateCustomerDto = {
        ...createDto,
        email: 'unique2@example.com', // Different email
        phoneNumber: '+16502530003',
        bankAccountNumber: 'NL91ABNA0417164308',
      };

      await request(app.getHttpServer())
        .post('/customers')
        .send(duplicateDto)
        .expect(HttpStatus.CONFLICT);
    });

    // Add tests for other validation rules (missing fields, invalid email format, etc.)
  });

  // Add describe blocks for GET /customers, GET /customers/:id, PUT /customers/:id, DELETE /customers/:id
  // following similar patterns: setup data -> send request -> assert status code -> assert response body -> assert DB state
});
