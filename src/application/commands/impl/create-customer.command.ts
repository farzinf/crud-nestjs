export class CreateCustomerCommand {
  constructor(
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly dateOfBirth: Date, // Use Date type internally
    public readonly phoneNumber: string,
    public readonly email: string,
    public readonly bankAccountNumber: string,
  ) {}
}
