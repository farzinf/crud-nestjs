import { Customer } from '../aggregates/customer.aggregate';
import { Email } from '../aggregates/customer.aggregate';

export interface ICustomerRepository {
  save(customer: Customer): Promise<Customer>;
  findById(id: string): Promise<Customer | null>;
  findAll(): Promise<Customer[]>;
  findByEmail(email: Email): Promise<Customer | null>;
  findByUniqueness(
    firstName: string,
    lastName: string,
    dateOfBirth: Date,
  ): Promise<Customer | null>;
  delete(id: string): Promise<boolean>;
  update(customer: Customer): Promise<Customer>;
}

export const CUSTOMER_REPOSITORY = Symbol('ICustomerRepository');
