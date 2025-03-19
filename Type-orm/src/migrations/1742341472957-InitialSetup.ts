import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSetup1742341472957 implements MigrationInterface {
    name = 'InitialSetup1742341472957'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "authors" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "bio" character varying, CONSTRAINT "PK_d2ed02fabd9b52847ccb85e6b88" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "books" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "isbn" character varying NOT NULL, "publication_year" integer NOT NULL, "average_rating" numeric(3,2), "image_url" character varying, "books_count" integer NOT NULL, CONSTRAINT "UQ_54337dc30d9bb2c3fadebc69094" UNIQUE ("isbn"), CONSTRAINT "PK_f3f2f25a099d24e12545b70b022" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "book_copies" ("id" SERIAL NOT NULL, "inventory_number" character varying NOT NULL, "condition" character varying NOT NULL, "status" character varying NOT NULL DEFAULT 'Available', "book_id" integer, CONSTRAINT "PK_f79606d3fd05df7dcce9542d438" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "borrowers" ("id" SERIAL NOT NULL, "borrow_date" date NOT NULL, "due_date" date NOT NULL, "return_date" date, "user_id" integer, "copy_id" integer, CONSTRAINT "PK_81e4cddf7ab4dbd5e79a8f84031" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "role_id" integer, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "roles" ("id" SERIAL NOT NULL, "role_name" character varying NOT NULL, "can_borrow" boolean NOT NULL, "can_manage" boolean NOT NULL, "is_admin" boolean NOT NULL, CONSTRAINT "UQ_ac35f51a0f17e3e1fe121126039" UNIQUE ("role_name"), CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "book_authors" ("book_id" integer NOT NULL, "author_id" integer NOT NULL, CONSTRAINT "PK_75172094a131109db714f4f2bc7" PRIMARY KEY ("book_id", "author_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_1d68802baf370cd6818cad7a50" ON "book_authors" ("book_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_6fb8ac32a0a0bbca076b2cf7c5" ON "book_authors" ("author_id") `);
        await queryRunner.query(`ALTER TABLE "book_copies" ADD CONSTRAINT "FK_d8c3c9e0b8d41aa149ac58f23fe" FOREIGN KEY ("book_id") REFERENCES "books"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "borrowers" ADD CONSTRAINT "FK_d897ce6fef4523cba630d0c8bd9" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "borrowers" ADD CONSTRAINT "FK_191befd7a31e268455f0cd88450" FOREIGN KEY ("copy_id") REFERENCES "book_copies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_a2cecd1a3531c0b041e29ba46e1" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "book_authors" ADD CONSTRAINT "FK_1d68802baf370cd6818cad7a503" FOREIGN KEY ("book_id") REFERENCES "books"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "book_authors" ADD CONSTRAINT "FK_6fb8ac32a0a0bbca076b2cf7c5a" FOREIGN KEY ("author_id") REFERENCES "authors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "book_authors" DROP CONSTRAINT "FK_6fb8ac32a0a0bbca076b2cf7c5a"`);
        await queryRunner.query(`ALTER TABLE "book_authors" DROP CONSTRAINT "FK_1d68802baf370cd6818cad7a503"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_a2cecd1a3531c0b041e29ba46e1"`);
        await queryRunner.query(`ALTER TABLE "borrowers" DROP CONSTRAINT "FK_191befd7a31e268455f0cd88450"`);
        await queryRunner.query(`ALTER TABLE "borrowers" DROP CONSTRAINT "FK_d897ce6fef4523cba630d0c8bd9"`);
        await queryRunner.query(`ALTER TABLE "book_copies" DROP CONSTRAINT "FK_d8c3c9e0b8d41aa149ac58f23fe"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6fb8ac32a0a0bbca076b2cf7c5"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1d68802baf370cd6818cad7a50"`);
        await queryRunner.query(`DROP TABLE "book_authors"`);
        await queryRunner.query(`DROP TABLE "roles"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "borrowers"`);
        await queryRunner.query(`DROP TABLE "book_copies"`);
        await queryRunner.query(`DROP TABLE "books"`);
        await queryRunner.query(`DROP TABLE "authors"`);
    }

}
