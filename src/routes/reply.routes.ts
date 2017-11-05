import { Express, Request, Response } from 'express';
import Reply from "../models/domain/reply";

export function routes(app: Express) {
	app.get('/api/employees', (req: Request, res: Response) => {
    Reply.findAll().then(employee => res.status(200).send(employee));
	});
}