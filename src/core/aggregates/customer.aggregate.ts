import { randomUUID } from 'crypto';

// Simple Value Objects (can be expanded)
export class Email {
  constructor(public readonly value: string) {
    // Basic validation, more robust in DTO/Application layer
    if (!value || !/\S+@\S+\.\S+/.test(value)) {
      throw new Error('Invalid email format'); // Domain exception later
    }
    this.value = value.toLowerCase(); // Normalize
  }
}

export class PhoneNumber {
  constructor(public readonly value: string) {
    // Basic validation for E.164 format assumption
    if (!value || !/^\+[1-9]\d{1,14}$/.test(value)) {
      // More specific validation happens in Application/Infrastructure layer
      // using libphonenumber, but domain ensures basic structure
      console.warn(
        `Potential non-E.164 phone number: ${value}. Relying on deeper validation.`,
      );
    }
    this.value = value;
  }
}

export class Customer {
  readonly id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  phoneNumber: PhoneNumber;
  email: Email;
  bankAccountNumber: string;

  private constructor(props: {
    id: string;
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    phoneNumber: PhoneNumber;
    email: Email;
    bankAccountNumber: string;
  }) {
    this.id = props.id;
    this.firstName = props.firstName;
    this.lastName = props.lastName;
    this.dateOfBirth = props.dateOfBirth;
    this.phoneNumber = props.phoneNumber;
    this.email = props.email;
    this.bankAccountNumber = props.bankAccountNumber;
  }

  public static create(props: {
    id?: string;
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    phoneNumber: string;
    email: string;
    bankAccountNumber: string;
  }): Customer {
    // Domain-level validation (basic non-null checks etc)
    if (
      !props.firstName ||
      !props.lastName ||
      !props.dateOfBirth ||
      !props.phoneNumber ||
      !props.email ||
      !props.bankAccountNumber
    ) {
      throw new Error('Missing required customer properties'); // Replace with specific Domain Exception
    }

    const customer = new Customer({
      id: props.id || randomUUID(),
      firstName: props.firstName,
      lastName: props.lastName,
      dateOfBirth: props.dateOfBirth,
      // Value object creation might move to application layer after validation
      phoneNumber: new PhoneNumber(props.phoneNumber),
      email: new Email(props.email),
      bankAccountNumber: props.bankAccountNumber,
    });

    return customer;
  }

  public update(props: {
    firstName?: string;
    lastName?: string;
    dateOfBirth?: Date;
    phoneNumber?: string;
    email?: string;
    bankAccountNumber?: string;
  }) {
    this.firstName = props.firstName ?? this.firstName;
    this.lastName = props.lastName ?? this.lastName;
    this.dateOfBirth = props.dateOfBirth ?? this.dateOfBirth;
    this.phoneNumber = new PhoneNumber(props.phoneNumber) ?? this.phoneNumber;
    this.email = new Email(props.email) ?? this.email;
    this.bankAccountNumber = props.bankAccountNumber ?? this.bankAccountNumber;
  }

  // For uniqueness check
  get uniquenessKey(): string {
    // Normalize date to avoid timezone issues in key generation
    const dobString = this.dateOfBirth.toISOString().split('T')[0];
    return `${this.firstName.toLowerCase()}_${this.lastName.toLowerCase()}_${dobString}`;
  }
}
