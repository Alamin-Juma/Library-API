import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable } from "typeorm";
import { BookCopy } from "./BookCopy";
import { Author } from "./Author";

@Entity("books")
export class Book {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column({ unique: true })
  isbn!: string;

  @Column()
  publication_year!: number;

  @Column({ type: "decimal", precision: 3, scale: 2, nullable: true })
  average_rating!: number;

  @Column({ nullable: true })
  image_url!: string;

  @Column()
  books_count!: number;

  @OneToMany(() => BookCopy, (copy) => copy.book)
  copies!: BookCopy[];

  @ManyToMany(() => Author, (author) => author.books)
  @JoinTable({
    name: "book_authors",
    joinColumn: {
      name: "book_id",
      referencedColumnName: "id",
    },
    inverseJoinColumn: {
      name: "author_id",
      referencedColumnName: "id",
    },
  })
  authors!: Author[];
}
