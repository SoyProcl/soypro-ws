import { Application } from "express";
import Ping from "./api/ping";
import Location from "./api/location";

export default function routes(app: Application) {
  app.use("/api/v1/ping", Ping);
  app.use("/api/v1/location", Location);
}
