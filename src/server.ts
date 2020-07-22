import express, {Application, Request, Response} from 'express';
import _get from 'lodash/get'

const port: number = parseInt(_get(process, 'env.PORT', 3000));
/* var express = require('express'); */

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


module.exports = app;
