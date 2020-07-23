import { Request, Response, Router } from "express";

export default Router().get("/", (req: Request, res: Response) => {
  res.json({ success: true });
});
