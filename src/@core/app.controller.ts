import * as Sentry from "@sentry/node";
import fetch from "node-fetch";
import { Request, Response, Router } from "express";
import { fromCache, setCache } from "./cache";
import _get from "lodash/get";

export default class AppController {
  props: any;

  constructor(props?: any) {
    props = props;
  }

  saveInCache = async (key: string, value: any, expiration: number = 300) => {
    try {
      setCache(key, value, expiration);
      return Promise.resolve(true);
    } catch (error) {
      return Promise.resolve(false);
    }
  };

  getFromCache = async (key: string) => {
    try {
      const data = await fromCache(key);
      return Promise.resolve(data);
    } catch (error) {
      return Promise.resolve(null);
    }
  };

  handleError = (req: Request, res: any) => {
    return (error: any, notify = true) => {
      console.log("[handleError] Error:", error);
      res.status(501).json(error);
      if (notify) Sentry.captureException(error);
    };
  };

  notifyError = (error: any) => {
    console.log("[ERROR]:", error);
    Sentry.captureException(error);
  };

  notifySlack = async (text: string) => {
    try {
      // Call slack webhook
      const channels = [
        {
          hook: _get(process, "env.SLACK_WEBHOOK", ""),
          dev: false,
          prod: true,
        },
        {
          hook: _get(process, "env.SLACK_DEVS_WEBHOOK", ""),
          dev: true,
          prod: true,
        },
      ];

      await Promise.all(
        channels.map(async ({ hook, dev, prod }) => {
          const send =
            (dev && (!process.env.ENV || process.env.ENV === "development")) ||
            (prod && process.env.ENV === "production");
          return send
            ? await fetch(hook, {
                method: "POST",
                body: JSON.stringify({ text }),
              })
            : null;
        })
      );

      // console.log('NOTIFY TO SLACK! ', response)
      return Promise.resolve(true);
    } catch (error) {
      // Notifico en Sentry
      this.notifyError(error);
      // Siempre retorno true para no entorpecer flujo
      return Promise.resolve(true);
    }
  };

  handleNotAllowedExeption = (req: Request, res: any) => {
    res.status(500).send({ message: "Not allowed!" });
  };
}
