import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetCustomerByIdQuery } from '../impl/get-customer-by-id.query';
import {
  ICustomerRepository,
  CUSTOMER_REPOSITORY,
} from '../../../core/repositories/customer.repository.interface';
import { Customer } from '../../../core/aggregates/customer.aggregate';
import { NotFoundException } from '@nestjs/common';

@QueryHandler(GetCustomerByIdQuery)
export class GetCustomerByIdHandler
  implements IQueryHandler<GetCustomerByIdQuery>
{
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly repository: ICustomerRepository,
  ) {}

  async execute(query: GetCustomerByIdQuery): Promise<Customer | null> {
    const customer = await this.repository.findById(query.id);
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${query.id} not found`);
    }
    return customer;
  }
}
