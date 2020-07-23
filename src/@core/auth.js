import jwt from "jsonwebtoken";
import _get from "lodash/get";
/* import Session from './../api/session/session.controller' */
import { fromCache, setCache } from "./cache";
export const getToken = (req) => {
  const authorization = _get(req, "headers.authorization", "FakeBearer ").split(
    " "
  );

  if (_get(authorization, "[0]", "") === "Bearer") {
    // Authorization: Bearer
    // Handle token presented as a Bearer token in the Authorization header
    return _get(authorization, "[1]", "");
  } else if (req.query && req.query.token) {
    // Handle token presented as URI param
    return req.query.token;
  } else if (req.cookies && req.cookies.token) {
    // Handle token presented as a cookie parameter
    return req.cookies.token;
  }
  // If we return null, we couldn't find a token.
  // In this case, the JWT middleware will return a 401 (unauthorized) to the client for this request
  return null;
};

export const hasRole = (role = []) => {
  return async (req, res, next) => {
    try {
      const token = getToken(req);
      let userRole = "";
      if (!token && role.indexOf("visit") !== -1) {
        userRole = "visit";
      } else {
        const { session } = await verifyToken(token);
        // Cache optimization
        const keyCache = `session-${session}`;
        let data = null; //await fromCache(keyCache)
        if (!data) {
          data = {}; //await Session.byId(session)
          setCache(keyCache, data);
        }
        req.session = data;
        userRole = _get(req, "session.user.role", "");
      }
      if (role.indexOf(userRole) !== -1) {
        next();
      } else {
        res.status(500).json({ message: "not allowed!", code: -1 });
      }
    } catch (error) {
      console.log("error", error);
      res.status(500).json({ message: "not allowed!", code: -2 });
    }
  };
};

export const verifyToken = async (token) => {
  return new Promise((resolve, reject) => {
    if (token) {
      jwt.verify(token, process.env.JWT_SECRET, function (err, decoded) {
        if (err) {
          reject(err);
        } else {
          resolve(decoded);
        }
      });
    } else {
      reject({ message: "not valid token!" });
    }
  });
};

export const signToken = async (data) => {
  return new Promise((resolve, reject) => {
    try {
      const JWT = jwt.sign(
        {
          exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365,
          ...data,
        },
        process.env.JWT_SECRET
      );

      resolve(JWT);
    } catch (error) {
      console.log("signToken error", error);
      reject(error);
    }
  });
};
