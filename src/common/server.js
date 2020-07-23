import Express from "express";
import * as Sentry from "@sentry/node";
import moesifExpress from "moesif-express";
/* import { connect } from './../@core/cache' */
import * as path from "path";
import * as bodyParser from "body-parser";
import * as http from "http";
import * as os from "os";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import * as admin from "firebase-admin";
/* import { OpenApiValidator } from 'express-openapi-validator' */

import l from "./logger";

export const app = new Express();

/* connect(cache => {
  console.log(cache)
})
 */
Sentry.init({
  dsn: "https://c7bf6c75a5724b6d99debad4afaad732@sentry.io/1491441",
});

var moesifMiddleware = moesifExpress({
  applicationId:
    "eyJhcHAiOiI2MTc6NzEwIiwidmVyIjoiMi4wIiwib3JnIjoiMjA3OjcxMyIsImlhdCI6MTU3OTA0NjQwMH0.2kY4S9rcroOAXIIP8XdTeenPha9BQ49AUPllINGO5ow",

  // Set to false if you don't want to capture payloads
  logBody: true,

  // Optional hook to link API calls to users
  identifyUser: function (req, res) {
    return req.session ? req.session._id : undefined;
  },
});

export default class ExpressServer {
  constructor() {
    const root = path.normalize(`${__dirname}/../..`);
    app.set("appPath", `${root}client`);
    app.use(
      bodyParser.json({
        limit: process.env.REQUEST_LIMIT || "100kb",
      })
    );
    app.use(
      bodyParser.urlencoded({
        extended: true,
        limit: process.env.REQUEST_LIMIT || "100kb",
      })
    );

    // CORS
    app.use((req, res, next) => {
      res.header("Access-Control-Allow-Origin", "*");
      res.header(
        "Access-Control-Allow-Headers",
        "Authorization, Bearer, Origin, X-Requested-With, Content-Type, Content-Range, Accept, Access-Control-Allow-Request-Method"
      );
      res.header("Access-Control-Expose-Headers", "Content-Range");
      res.header("Access-Control-Expose-Headers", "X-Total-Count");
      res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, OPTIONS, PUT, DELETE"
      );
      res.header("Allow", "GET, POST, OPTIONS, PUT, DELETE");
      next();
    });

    // Connect to MongoDB
    mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true });
    mongoose.connection.on("error", function (err) {
      console.error("MongoDB connection error: " + err);
      process.exit(-1);
    });

    /* var serviceAccount = require(process.env.GOOGLE_APPLICATION_CREDENTIALS)
    console.log('serviceAccount', serviceAccount) */
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      //credential: admin.credential.cert(serviceAccount),
      databaseURL: "https://soy-pro-1c307.firebaseio.com",
    });

    app.use(cookieParser(process.env.SESSION_SECRET));
    app.use(Express.static(`${root}/public`));

    //app.use(Sentry.Handlers.errorHandler())

    app.use(moesifMiddleware);
    /* const apiSpecPath = path.join(__dirname, 'api.yml')
    app.use(process.env.OPENAPI_SPEC || '/spec', Express.static(apiSpecPath))
    new OpenApiValidator({
      apiSpecPath
    }).install(app) */
  }

  router(routes) {
    routes(app);
    app.use((err, req, res, next) => {
      const errors = err.errors || [{ message: err.message }];
      res.status(err.status || 500).json({ errors });
    });

    return this;
  }

  listen(port = process.env.PORT) {
    const welcome = (p) => () =>
      l.info(
        `up and running in ${
          process.env.NODE_ENV || "development"
        } @: ${os.hostname()} on port: ${p}}`
      );
    http.createServer(app).listen(port, welcome(port));
    return app;
  }
}
