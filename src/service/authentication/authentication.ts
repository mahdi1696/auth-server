import { Request, Response, NextFunction } from "express";
import { repository_user_getByNanoId as getUserByNanoId } from "../../repository/user.repository";
import { jwtValidator } from "./jwtService";
import { TokenExpiredError } from "jsonwebtoken";
import { Session } from "type";

export const authenticationAndAuthorization = (
  role: "admin" | "customer",
  authority?: string
) => {
  return async function (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const cookie = req.headers.cookie;

    // Try to extract token from USER_SESSION cookie
    let token: string | undefined = req
      .header("Authorization")
      ?.replace("Bearer ", "");

    if (!token && cookie) {
      token = getAccessTokenFormRequest(req);
    }

    if (!token) {
      res.status(401).send("Access denied. No token provided.");
      return;
    }

    try {
      const verified = await jwtValidator(token);
      if (role === "admin") {
        const user = await getUserByNanoId(verified.nanoId);
        if (user && user.authorities === authority) {
          req.user = user;
          return next();
        } else {
          res.status(401).send("access denied");
          return;
        }
      } else {
        const user = {
          nanoId: verified.nanoId,
          authority: verified.authority,
          admin: false,
        };
        req.user = user;
        next();
        return;
      }
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        res.status(401).send("your token has expired");
        return;
      }
      res.status(401).send("access denied");
      return;
    }
  };
};

export const getAccessTokenFormRequest = (req: Request): string | undefined => {
  const cookie = req.headers.cookie;
  if (cookie) {
    const parsedCookies = Object.fromEntries(
      cookie.split("; ").map((c) => c.split("="))
    );
    if (parsedCookies.USER_SESSION) {
      const userSession = JSON.parse(
        decodeURIComponent(parsedCookies.USER_SESSION)
      );
      return userSession?.accessToken;
    }
  }
};

export const getUserSessionCookie = (req: Request): Session | undefined => {
  const cookie = req.headers.cookie;
  if (cookie) {
    const parsedCookies = Object.fromEntries(
      cookie.split("; ").map((c) => c.split("="))
    );
    if (parsedCookies.USER_SESSION) {
      const userSession: Session = JSON.parse(
        decodeURIComponent(parsedCookies.USER_SESSION)
      );
      return userSession;
    }
  }
};
