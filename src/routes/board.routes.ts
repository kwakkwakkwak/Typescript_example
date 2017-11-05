import { Express, Request, Response } from 'express';
import Board from "../models/domain/board";

export function routes(app: Express) {
	app.get('/api/employees', (req: Request, res: Response) => {
    Board.findAll().then(employee => res.status(200).send(employee));
	});
}