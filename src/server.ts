import "./common/env";
import Server, { app } from "./common/server";
import routes from "./routes";

import _get from "lodash/get";
const port: string = _get(process, "env.PORT", "3000");

export default new Server().router(routes).listen(port);

/* 
import express, {Application, Request, Response} from 'express';

import _get from 'lodash/get'

const port: number = parseInt(_get(process, 'env.PORT', 3000));

var app: Application = express();

app.get('/', function(req: Request, res: Response) {
  res.send({
    "Output": "Aloha como andamios! 2"
  });
});

app.post('/', function(req: Request, res: Response) {
  res.send({
    "Output": "Hello World!"
  });
});

app.listen(port);


module.exports = app; */
