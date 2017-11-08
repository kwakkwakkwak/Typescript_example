import {Table, Column, Model, PrimaryKey, AutoIncrement, CreatedAt, UpdatedAt, HasMany} from "sequelize-typescript";
import Reply from "./reply";


@Table
export default class Board extends Model<Board> {

  @AutoIncrement
  @PrimaryKey
  @Column
  bno: number;

  @Column
  title: string;

  @Column
  content: string;

  @Column
  writer : string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt : Date;

  @HasMany(() => Reply)
  replies: Reply[];

}