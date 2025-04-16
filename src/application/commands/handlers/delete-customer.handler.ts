import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { DeleteCustomerCommand } from '../impl/delete-customer.command';
import {
  ICustomerRepository,
  CUSTOMER_REPOSITORY,
} from '../../../core/repositories/customer.repository.interface';

@CommandHandler(DeleteCustomerCommand)
export class DeleteCustomerHandler
  implements ICommandHandler<DeleteCustomerCommand>
{
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository,
  ) {}

  async execute(command: DeleteCustomerCommand): Promise<boolean> {
    const { id } = command;

    const savedCustomer = await this.customerRepository.delete(id);

    return savedCustomer;
  }
}
