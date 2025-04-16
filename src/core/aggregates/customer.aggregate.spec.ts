import { Customer, Email, PhoneNumber } from './customer.aggregate';

describe('Customer Aggregate', () => {
  describe('Email Value Object', () => {
    it('should create a valid Email', () => {
      const email = new Email('test@example.com');
      expect(email.value).toBe('test@example.com');
    });

    it('should throw an error for an invalid email', () => {
      expect(() => new Email('invalid-email')).toThrow('Invalid email format');
    });

    it('should normalize the email to lowercase', () => {
      const email = new Email('TEST@example.com');
      expect(email.value).toBe('test@example.com');
    });
  });

  describe('PhoneNumber Value Object', () => {
    it('should create a valid PhoneNumber', () => {
      const phoneNumber = new PhoneNumber('+16502530000');
      expect(phoneNumber.value).toBe('+16502530000');
    });

    it('should warn for a potentially invalid PhoneNumber format', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const phoneNumber = new PhoneNumber('12345');
      expect(phoneNumber.value).toBe('12345');
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Potential non-E.164 phone number: 12345. Relying on deeper validation.',
      );
      consoleWarnSpy.mockRestore();
    });
  });

  describe('Customer Entity', () => {
    it('should create a valid Customer', () => {
      const customer = Customer.create({
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: new Date('1990-01-01'),
        phoneNumber: '+16502530000',
        email: 'john.doe@example.com',
        bankAccountNumber: 'NL91ABNA0417164300',
      });

      expect(customer.id).toBeDefined();
      expect(customer.firstName).toBe('John');
      expect(customer.lastName).toBe('Doe');
      expect(customer.dateOfBirth).toEqual(new Date('1990-01-01'));
      expect(customer.phoneNumber.value).toBe('+16502530000');
      expect(customer.email.value).toBe('john.doe@example.com');
      expect(customer.bankAccountNumber).toBe('NL91ABNA0417164300');
    });

    it('should create a valid customer with given id', () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';
      const customer = Customer.create({
        id: id,
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: new Date('1990-01-01'),
        phoneNumber: '+16502530000',
        email: 'john.doe@example.com',
        bankAccountNumber: 'NL91ABNA0417164300',
      });

      expect(customer.id).toBe(id);
    });

    it('should throw an error if required properties are missing', () => {
      expect(() =>
        Customer.create({
          firstName: 'John',
          lastName: 'Doe',
          dateOfBirth: new Date('1990-01-01'),
          phoneNumber: '+16502530000',
          email: '', // Missing email
          bankAccountNumber: 'NL91ABNA0417164300',
        }),
      ).toThrow('Missing required customer properties');
    });

    it('should update customer properties', () => {
      const customer = Customer.create({
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: new Date('1990-01-01'),
        phoneNumber: '+16502530000',
        email: 'john.doe@example.com',
        bankAccountNumber: 'NL91ABNA0417164300',
      });

      customer.update({
        firstName: 'Updated',
        lastName: 'Name',
        dateOfBirth: new Date('1995-02-02'),
        phoneNumber: '+16502530001',
        email: 'updated.email@example.com',
        bankAccountNumber: 'NL91ABNA0417164301',
      });

      expect(customer.firstName).toBe('Updated');
      expect(customer.lastName).toBe('Name');
      expect(customer.dateOfBirth).toEqual(new Date('1995-02-02'));
      expect(customer.phoneNumber.value).toBe('+16502530001');
      expect(customer.email.value).toBe('updated.email@example.com');
      expect(customer.bankAccountNumber).toBe('NL91ABNA0417164301');
    });

    it('should generate a correct uniqueness key', () => {
      const customer = Customer.create({
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: new Date('1990-01-01'),
        phoneNumber: '+16502530000',
        email: 'john.doe@example.com',
        bankAccountNumber: 'NL91ABNA0417164300',
      });

      expect(customer.uniquenessKey).toBe('john_doe_1990-01-01');
    });
  });
});
