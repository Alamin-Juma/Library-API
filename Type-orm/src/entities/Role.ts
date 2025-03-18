import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { User } from "./User";

@Entity("roles")
export class Role {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  role_name!: string;

  @Column()
  can_borrow!: boolean;

  @Column()
  can_manage!: boolean;

  @Column()
  is_admin!: boolean;

  @OneToMany(() => User, (user) => user.role)
  users!: User[];
}
