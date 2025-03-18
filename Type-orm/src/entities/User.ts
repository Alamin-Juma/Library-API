import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from "typeorm";
import { Borrower } from "./Borrower";
import { Role } from "./Role";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  id!: number;  // Use ! to suppress the error

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @ManyToOne(() => Role, (role) => role.users)
  @JoinColumn({ name: "role_id" })
  role!: Role;

  @OneToMany(() => Borrower, (borrower) => borrower.user)
  borrowRecords!: Borrower[];
}
