import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CustomersController } from '../controllers/customers.controller';
import { CreateCustomerHandler } from '../../application/commands/handlers/create-customer.handler';
import { GetCustomerByIdHandler } from '../../application/queries/handlers/get-customer-by-id.handler';
import { GetAllCustomersHandler } from '../../application/queries/handlers/get-all-customers.handler';
import { UpdateCustomerHandler } from '../../application/commands/handlers/update-customer.handler';
import { DeleteCustomerHandler } from '../../application/commands/handlers/delete-customer.handler';

import { InfrastructureModule } from '../../infrastructure/infrastructure.module';

export const CommandHandlers = [
  CreateCustomerHandler,
  UpdateCustomerHandler,
  DeleteCustomerHandler,
];
export const QueryHandlers = [GetCustomerByIdHandler, GetAllCustomersHandler];

@Module({
  imports: [CqrsModule, InfrastructureModule],
  controllers: [CustomersController],
  providers: [...CommandHandlers, ...QueryHandlers],
})
export class CustomerModule {}
