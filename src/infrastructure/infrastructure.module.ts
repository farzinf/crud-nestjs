import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerEntity } from './database/entities/customer.entity';
import { CustomerRepository } from './database/repositories/customer.repository';
import { GoogleLibPhoneNumberValidator } from './external-services/google-phone-validator.service';
import { CUSTOMER_REPOSITORY } from '../core/repositories/customer.repository.interface';
import { PHONE_NUMBER_VALIDATOR } from '../application/interfaces/phone-validator.interface';

@Module({
  imports: [TypeOrmModule.forFeature([CustomerEntity])],
  providers: [
    {
      provide: CUSTOMER_REPOSITORY,
      useClass: CustomerRepository,
    },
    {
      provide: PHONE_NUMBER_VALIDATOR,
      useClass: GoogleLibPhoneNumberValidator,
    },
  ],
  exports: [CUSTOMER_REPOSITORY, PHONE_NUMBER_VALIDATOR],
})
export class InfrastructureModule {}
