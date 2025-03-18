import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./User";
import { BookCopy } from "./BookCopy";

@Entity("borrowers")
export class Borrower {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, (user) => user.borrowRecords)
  @JoinColumn({ name: "user_id" })
  user!: User;

  @ManyToOne(() => BookCopy, (copy) => copy.borrowRecords)
  @JoinColumn({ name: "copy_id" })
  copy!: BookCopy;

  @Column({ type: "date" })
  borrow_date!: Date;

  @Column({ type: "date" })
  due_date!: Date;

  @Column({ type: "date", nullable: true })
  return_date!: Date | null;
}
