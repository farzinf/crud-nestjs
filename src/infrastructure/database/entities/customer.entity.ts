import { Entity, PrimaryColumn, Column, Index } from 'typeorm';

@Entity('customers')
@Index(['firstName', 'lastName', 'dateOfBirth'], { unique: true })
export class CustomerEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ type: 'date' })
  dateOfBirth: string;

  @Column({ type: 'varchar', length: 20 })
  phoneNumber: string;

  @Column({ unique: true })
  email: string;

  @Column()
  bankAccountNumber: string;
}
