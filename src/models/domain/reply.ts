import {Table, Column, Model, HasMany, PrimaryKey, AutoIncrement, Default} from "sequelize-typescript";
import Board from "./board";

@Table
export default class Reply extends Model<Reply> {


  @HasMany(() => Board)
  bno: number[];

  @PrimaryKey
  @AutoIncrement
  @Column
  rno: number;

  @Column
  reply: string;

  @Column
  writer : string;


  @Default(1)
  @Column
  depth : number;
}