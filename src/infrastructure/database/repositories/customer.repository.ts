import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerEntity } from '../entities/customer.entity';
import { ICustomerRepository } from '../../../core/repositories/customer.repository.interface';
import { Customer, Email } from '../../../core/aggregates/customer.aggregate';

@Injectable()
export class CustomerRepository implements ICustomerRepository {
  constructor(
    @InjectRepository(CustomerEntity)
    private readonly ormRepository: Repository<CustomerEntity>,
  ) {}

  private entityToAggregate(entity: CustomerEntity): Customer {
    if (!entity) return null;

    const dob = new Date(entity.dateOfBirth + 'T00:00:00Z');
    const customer = Customer.create({
      id: entity.id,
      firstName: entity.firstName,
      lastName: entity.lastName,
      dateOfBirth: dob,
      phoneNumber: entity.phoneNumber,
      email: entity.email,
      bankAccountNumber: entity.bankAccountNumber,
    });
    return customer;
  }

  private aggregateToEntity(customer: Customer): CustomerEntity {
    const entity = new CustomerEntity();
    entity.id = customer.id;
    entity.firstName = customer.firstName;
    entity.lastName = customer.lastName;
    // Store date as YYYY-MM-DD string to avoid timezone issues in DB
    entity.dateOfBirth = customer.dateOfBirth.toISOString().split('T')[0];
    entity.phoneNumber = customer.phoneNumber.value;
    entity.email = customer.email.value;
    entity.bankAccountNumber = customer.bankAccountNumber;
    return entity;
  }

  async save(customer: Customer): Promise<Customer> {
    const entity = this.aggregateToEntity(customer);

    const savedEntity = await this.ormRepository.save(entity);
    return this.entityToAggregate(savedEntity);
  }

  async update(customer: Customer): Promise<Customer> {
    const existingEntity = await this.ormRepository.findOneBy({
      id: customer.id,
    });
    if (!existingEntity) {
      throw new NotFoundException(
        `Customer with ID ${customer.id} not found for update.`,
      );
    }
    const entity = this.aggregateToEntity(customer);
    const updatedEntity = await this.ormRepository.save(entity);
    return this.entityToAggregate(updatedEntity);
  }

  async findById(id: string): Promise<Customer | null> {
    const entity = await this.ormRepository.findOneBy({ id });
    return this.entityToAggregate(entity);
  }

  async findAll(): Promise<Customer[]> {
    const entities = await this.ormRepository.find();
    return entities.map(this.entityToAggregate);
  }

  async findByEmail(email: Email): Promise<Customer | null> {
    const entity = await this.ormRepository.findOneBy({ email: email.value });
    return this.entityToAggregate(entity);
  }

  async findByUniqueness(
    firstName: string,
    lastName: string,
    dateOfBirth: Date,
  ): Promise<Customer | null> {
    const dobString = dateOfBirth.toISOString().split('T')[0];
    const entity = await this.ormRepository.findOneBy({
      firstName,
      lastName,
      dateOfBirth: dobString,
    });
    return this.entityToAggregate(entity);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.ormRepository.delete(id);
    return result.affected > 0;
  }
}
