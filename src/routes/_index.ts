import {Express, Request, Response} from 'express';
import * as boardRoutes from './board.routes';
import * as replyRoutes from './reply.routes';

export function initRoutes(app: Express) {

	app.get('/api', (req: Request, res: Response) => {
		res.status(200).send({
			message: 'server is running!'
		});
	});

	// Routes 정의
  boardRoutes.routes(app);
  replyRoutes.routes(app);
}