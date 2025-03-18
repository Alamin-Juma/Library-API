export interface UserPayload {
    id: number;
    email: string;
    role: string;
  }
  
  export interface BookCreateDTO {
    title: string;
    isbn: string;
    publicationYear: number;
    authors: number[] | { id: number }[] | { name: string }[];
    imageUrl?: string;
    averageRating?: number;
    copiesCount: number;
  }
  
  export interface BookUpdateDTO {
    title?: string;
    isbn?: string;
    publicationYear?: number;
    authors?: number[] | { id: number }[] | { name: string }[];
    imageUrl?: string;
    averageRating?: number;
  }
  
  export interface BookCopyCreateDTO {
    bookId: number;
    inventoryNumber: string;
    condition: string;
  }
  
  export interface BorrowBookDTO {
    userId: number;
    copyId: number;
    dueDate?: Date;
  }
  
  export interface UserCreateDTO {
    name: string;
    email: string;
    password: string;
    roleId: number;
  }
  
  export interface LoginDTO {
    email: string;
    password: string;
  }