import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  ValidationPipe,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UsePipes,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { CreateCustomerDto } from '../../application/dtos/create-customer.dto';
import { UpdateCustomerDto } from '../../application/dtos/update-customer.dto';
import { CustomerDto } from '../../application/dtos/customer.dto';
import { CreateCustomerCommand } from '../../application/commands/impl/create-customer.command';
import { GetCustomerByIdQuery } from '../../application/queries/impl/get-customer-by-id.query';
import { GetAllCustomersQuery } from '../../application/queries/impl/get-all-customers.query';
import { DeleteCustomerCommand } from '../../application/commands/impl/delete-customer.command';
import { UpdateCustomerCommand } from '../../application/commands/impl/update-customer.command';
import { Customer } from '../../core/aggregates/customer.aggregate';

@ApiTags('customers')
@Controller('customers')
export class CustomersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  @ApiOperation({ summary: 'Create a new customer' })
  @ApiBody({ type: CreateCustomerDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Customer created successfully.',
    type: CustomerDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Customer already exists (email or name+dob uniqueness).',
  })
  async create(
    @Body() createCustomerDto: CreateCustomerDto,
  ): Promise<CustomerDto> {
    const command = new CreateCustomerCommand(
      createCustomerDto.firstName,
      createCustomerDto.lastName,
      new Date(createCustomerDto.dateOfBirth),
      createCustomerDto.phoneNumber,
      createCustomerDto.email,
      createCustomerDto.bankAccountNumber,
    );
    const result: Customer = await this.commandBus.execute(command);
    return CustomerDto.fromAggregate(result);
  }

  @Get()
  @ApiOperation({ summary: 'Get all customers' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of all customers.',
    type: [CustomerDto],
  })
  async findAll(): Promise<CustomerDto[]> {
    const query = new GetAllCustomersQuery();
    const result: Customer[] = await this.queryBus.execute(query);
    return result.map(CustomerDto.fromAggregate);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a customer by ID' })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Customer UUID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Customer found.',
    type: CustomerDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Customer not found.',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<CustomerDto> {
    const query = new GetCustomerByIdQuery(id);
    const result: Customer = await this.queryBus.execute(query);
    return CustomerDto.fromAggregate(result);
  }

  @Put(':id')
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  @ApiOperation({ summary: 'Update a customer' })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Customer UUID',
  })
  @ApiBody({ type: UpdateCustomerDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Customer updated successfully.',
    type: CustomerDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Customer not found.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Email conflict during update.',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ): Promise<CustomerDto> {
    const command = new UpdateCustomerCommand(
      id,
      updateCustomerDto.firstName,
      updateCustomerDto.lastName,
      new Date(updateCustomerDto.dateOfBirth),
      updateCustomerDto.phoneNumber,
      updateCustomerDto.email,
      updateCustomerDto.bankAccountNumber,
    );
    const result: Customer = await this.commandBus.execute(command);
    return CustomerDto.fromAggregate(result);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a customer' })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Customer UUID',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Customer deleted successfully.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Customer not found.',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    const command = new DeleteCustomerCommand(id);
    await this.commandBus.execute(command);
  }
}
