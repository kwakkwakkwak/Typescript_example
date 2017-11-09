import {Table, Column, Model, PrimaryKey, AutoIncrement, Default, ForeignKey, HasMany} from "sequelize-typescript";
import Board from "./board";

@Table
export default class Reply extends Model<Reply> {


  @ForeignKey(() => Board)
  @Column
  bno: number;

  @PrimaryKey
  @AutoIncrement
  @Column

  rno: number;

  @Column
  reply: string;

  @Column
  writer : string;

  // @Default(1)
  // @Column
  // depth : number;

  @ForeignKey(()=>Reply)
  @Column
  parent: number;

  // @Column
  // order : number;

  @HasMany(() =>Reply)
  replies : Reply[];
}