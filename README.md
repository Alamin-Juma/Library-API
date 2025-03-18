# Library Management System API

A robust and scalable RESTful API built with Node.js, Express, and Sequelize for managing a library system. This API allows you to manage books, authors, and the borrowing/returning of books, all while following best practices in API design and code organization.

## Overview

This project demonstrates a full-featured library management system backend that includes:

- **Book Management:**  
  - Add, update, and delete books (deletion is allowed only if the book is not currently borrowed).  
  - List books with pagination support.  
  - Automatically seed your database with sample book data from a CSV file.

- **Borrowing & Returning Books:**  
  - Borrow books with checks for availability, user tracking, and automatic due dates (default 14 days).  
  - Return books and track overdue returns with calculated late days.

- **Reports & Search:**  
  - Generate reports of overdue books including user details and days overdue.  
  - Bonus: Search functionality to filter books by title, author, or ISBN.

## Technical Highlights

- **Backend Framework:**  
  Built with [Express.js](https://expressjs.com/) for a lightweight and flexible server setup.

- **Database Management:**  
  Uses [Sequelize](https://sequelize.org/) as the ORM to manage database interactions with PostgreSQL, including migrations and seeders for automated setup.

- **RESTful Design:**  
  Follows RESTful standards with clear endpoints, HTTP methods, and response codes.

- **Validation & Error Handling:**  
  Implements basic data validation and robust error handling to ensure a reliable API.

- **Testing:**  
  Automated tests using [Jest](https://jestjs.io/) and [Supertest](https://github.com/visionmedia/supertest) to ensure quality and maintainability.

- **Deployment & Automation:**  
  Includes npm scripts for installing dependencies, running migrations, seeding the database, starting the server, and running tests—all with a single command.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (Latest LTS recommended)
- [npm](https://www.npmjs.com/) or [Yarn](https://yarnpkg.com/)
- PostgreSQL database setup

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/YourUsername/library-management.git
   cd library-management
```
# Project Setup and Usage

## Install Dependencies

```bash
npm install
```
Environment Configuration
Create a .env file at the project root to configure your database connection and other environment variables.

Database Setup
Run the following command to create your database schema and seed it with sample data:

```bash
npm run migrate
```

Running the API Server
Start the server with:
```bash
npm start
```

For development with live reloading:
```bash
npm run dev
```
Running Tests
Run all automated tests with:
```bash
npm test
```

API Documentation
The API is designed with standard RESTful endpoints. Below are some example routes:

Books:
GET /api/books - List all books with pagination.

POST /api/books - Create a new book.

PUT /api/books/:id - Update an existing book.

DELETE /api/books/:id - Delete a book (only if not borrowed).

Borrowing:
POST /api/books/:id/borrow - Borrow a book.

POST /api/books/:id/return - Return a book.

Reports:
GET /api/reports/overdue - List overdue books with user details and days overdue.

For full API documentation, please refer to the inline documentation in the code or generate a documentation file using tools like Swagger.

Contributing
Contributions are welcome! Please fork the repository and create a pull request. For major changes, please open an issue first to discuss what you would like to change.

License
This project is licensed under the MIT License.