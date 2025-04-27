import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateCustomerCommand } from '../impl/create-customer.command';
import {
  ICustomerRepository,
  CUSTOMER_REPOSITORY,
} from '../../../core/repositories/customer.repository.interface';
import {
  IPhoneNumberValidator,
  PHONE_NUMBER_VALIDATOR,
  IPhoneNumberInfo,
} from '../../interfaces/phone-validator.interface';
import { Customer, Email } from '../../../core/aggregates/customer.aggregate';
import { DuplicateCustomerException } from '../../exceptions/duplicate-customer.exception';
import { InvalidPhoneNumberException } from '../../exceptions/invalid-phone-number.exception';
// Assume CustomerCreatedEvent exists in core/events
// import { CustomerCreatedEvent } from '../../../core/events/customer-created.event';

@CommandHandler(CreateCustomerCommand)
export class CreateCustomerHandler
  implements ICommandHandler<CreateCustomerCommand>
{
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository,
    @Inject(PHONE_NUMBER_VALIDATOR)
    private readonly phoneValidator: IPhoneNumberValidator, // private readonly eventBus: EventBus, // Inject EventBus if using domain events
  ) {}

  async execute(command: CreateCustomerCommand): Promise<Customer> {
    const {
      firstName,
      lastName,
      dateOfBirth,
      phoneNumber,
      email,
      bankAccountNumber,
    } = command;

    // 1. Validate Phone Number
    const phoneInfo: IPhoneNumberInfo = await this.phoneValidator.validate(
      phoneNumber,
    );
    // Check if the phone number is valid and mobile
    if (!phoneInfo.isValid) {
      throw new InvalidPhoneNumberException(
        phoneNumber,
        'Invalid E.164 format',
      );
    }
    if (!phoneInfo.isMobile) {
      throw new InvalidPhoneNumberException(phoneNumber, 'Not a mobile number');
    }
    const validatedPhoneNumber = phoneInfo.e164Format || phoneNumber; // Use formatted number if available

    // 2. Check for uniqueness: Email
    const existingCustomerByEmail = await this.customerRepository.findByEmail(
      new Email(email),
    );
    if (existingCustomerByEmail) {
      throw new DuplicateCustomerException(
        `Customer with email ${email} already exists.`,
      );
    }

    // 3. Check for uniqueness: FirstName, LastName, DateOfBirth
    const existingCustomerByUniqueness =
      await this.customerRepository.findByUniqueness(
        firstName,
        lastName,
        dateOfBirth,
      );
    if (existingCustomerByUniqueness) {
      throw new DuplicateCustomerException(
        `Customer with name ${firstName} ${lastName} and DOB ${
          dateOfBirth.toISOString().split('T')[0]
        } already exists.`,
      );
    }

    // 4. Create Aggregate
    // Use validatedPhoneNumber here
    const customer = Customer.create({
      firstName,
      lastName,
      dateOfBirth,
      phoneNumber: validatedPhoneNumber, // Pass validated number
      email,
      bankAccountNumber,
    });

    // 5. Persist using Repository
    const savedCustomer = await this.customerRepository.save(customer);

    // 6. Publish Domain Event (Optional for this exercise scope, but good practice)
    // customer.getUncommittedEvents().forEach(event => this.eventBus.publish(event));
    // Example: this.eventBus.publish(new CustomerCreatedEvent(savedCustomer.id, ...));

    return savedCustomer;
  }
}
