import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetAllCustomersQuery } from '../impl/get-all-customers.query';
import {
  ICustomerRepository,
  CUSTOMER_REPOSITORY,
} from '../../../core/repositories/customer.repository.interface';
import { Customer } from '../../../core/aggregates/customer.aggregate';

@QueryHandler(GetAllCustomersQuery)
export class GetAllCustomersHandler
  implements IQueryHandler<GetAllCustomersQuery>
{
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly repository: ICustomerRepository,
  ) {}

  async execute(query: GetAllCustomersQuery): Promise<Customer[]> {
    const customers = await this.repository.findAll();
    return customers;
  }
}
