import {Table, Column, Model, ForeignKey, PrimaryKey, AutoIncrement, CreatedAt, UpdatedAt} from "sequelize-typescript";
import Reply from "./reply";

@Table
export default class Board extends Model<Board> {

  @AutoIncrement
  @PrimaryKey
  @ForeignKey(() => Reply)
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

}