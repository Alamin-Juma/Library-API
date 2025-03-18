import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { Book } from "./Book";
import { Borrower } from "./Borrower";

@Entity("book_copies")
export class BookCopy {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  inventory_number: string;

  @Column()
  condition: string; // "New", "Good", "Fair", "Poor"

  @Column({ default: "Available" })
  status: string; // "Available", "Borrowed"

  @ManyToOne(() => Book, (book) => book.copies)
  @JoinColumn({ name: "book_id" })
  book: Book;

  @OneToMany(() => Borrower, (borrower) => borrower.copy)
  borrowRecords: Borrower[];
}