import {Sequelize} from "sequelize-typescript";
import DataSource from "../config/data-source";
import Board from "./domain/board";
import Reply from "./domain/reply";


class DatabaseConfig {

	private _sequelize: Sequelize;

	constructor() {
		const sequelize = new Sequelize({
			...new DataSource().getConfig
		});
		sequelize.addModels([Board,Reply]);
		this._sequelize = sequelize;
	}

	get getSequelize() {
		return this._sequelize;
	}
}

const database = new DatabaseConfig();
export const sequelize = database.getSequelize;