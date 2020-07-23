import { Router } from "express";
import controller from "./location.controller";

export default Router()
  .post("/:type", controller.create)
  .get("/:type", controller.all);
/*   .get('/', controller.all)
  .get('/:id', controller.byId)
  .delete('/:id', controller.remove) */
