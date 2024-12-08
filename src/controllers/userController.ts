import { Request, Response } from "express";
import StatusCode from "status-code-enum";
import {
  repository_user_getByNanoId,
  repository_user_getByPhoneNumber,
} from "../repository/user.repository";
import { compare } from "bcryptjs";
import {
  generateTokens,
  jwtValidator,
  refreshTokenValidator,
} from "../service/authentication/jwtService";
import { getUserSessionCookie } from "../service/authentication/authentication";
import { omit } from "lodash";
import delay from "../util/delay";

export const cookieName = "USER_SESSION";

export const controller_user_loginCookie_post = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userName, password }: { userName: string; password: string } =
    req.body;

  if (userName && password) {
    try {
      const token = await loginService(userName, password);
      const tokenString = JSON.stringify(token);
      //we can also add maxAge
      res.cookie(cookieName, tokenString, {
        httpOnly: true,
      });
      res.send(token);
      return;
    } catch (error) {
      res.status(401).send("username or password is wrong");
    }
  } else {
    res
      .status(StatusCode.ClientErrorBadRequest)
      .send("please send username and password");
  }
};

const refreshingTokenQueue = new Map<string, Response[]>();
export const controller_user_generateAccessTokenByRefreshToken_post = async (
  req: Request,
  res: Response
): Promise<unknown> => {
  const refreshToken =
    req.body.refreshToken ?? getUserSessionCookie(req)?.refreshToken;

  if (!refreshToken) {
    return res.status(401).send("Please send refresh token");
  }

  let payload;
  try {
    payload = await refreshTokenValidator(refreshToken);
  } catch (error) {
    return res.status(401).send("Invalid refresh token");
  }

  try {
    const user = await repository_user_getByNanoId(payload.nanoId);

    if (user.refreshToken !== refreshToken) {
      return res.status(401).send("refresh token is not belong to this user");
    }

    // Queue the response if a refresh is already in progress
    const queue = refreshingTokenQueue.get(refreshToken);
    if (queue) {
      queue.push(res);
      return;
    }

    // Initialize queue and perform token refresh
    refreshingTokenQueue.set(refreshToken, [res]);

    try {
      const tokens = await generateTokens({
        authority: user.authorities,
        nanoId: user.nanoId,
        admin: user.isAdmin,
      });

      //fake delay
      await delay(10_000);
      // Get queued responses for the token and send the refreshed tokens
      const responses = refreshingTokenQueue.get(refreshToken);
      responses?.forEach((queuedRes) => {
        queuedRes.cookie("USER_SESSION", JSON.stringify(tokens), {
          httpOnly: true,
        });
        queuedRes.status(200).send(tokens);
      });
    } catch (error) {
      const responses = refreshingTokenQueue.get(refreshToken);
      responses?.forEach((queuedRes) =>
        queuedRes.status(500).send("Token generation error")
      );
    } finally {
      // Clear the queue for this token after all responses are sent
      refreshingTokenQueue.delete(refreshToken);
    }
  } catch (error) {
    res.status(500).send("Internal server error");
  }
};

/**
 * Controller to validate a user's refresh token and, if valid,
 * return authentication tokens (access and refresh tokens) from the cookie.
 *
 * This method checks for a valid refresh token in the request cookies,
 * validates it, and, if successful, retrieves and returns the tokens in
 * the response body.
 *
 * @param {Request} req - Express request object containing the refresh token in the cookies.
 * @returns {Promise<unknown>} - Sends the tokens (status 200) or an error message (status 401 or 500).
 *
 * Error Scenarios:
 * - 401: Missing or invalid refresh token, or if the token does not match the user.
 * - 500: Internal server error.
 *
 * Example Response:
 * - Success: JSON with access and refresh tokens.
 * - Error: Error message with the appropriate status code.
 */
export const controller_user_getSessionWithRefreshToken_get = async (
  req: Request,
  res: Response
): Promise<unknown> => {
  const session = getUserSessionCookie(req);
  if (!session.refreshToken) {
    return res.status(401).send("Please send refresh token");
  }

  let payload;
  try {
    payload = await refreshTokenValidator(session.refreshToken);
  } catch (error) {
    return res.status(401).send("Invalid refresh token");
  }

  try {
    const user = await repository_user_getByNanoId(payload.nanoId);

    if (user.refreshToken !== session.refreshToken) {
      return res.status(401).send("refresh token is not belong to this user");
    }
    res.status(200).send(session);
  } catch (error) {
    return res.status(500).send("Internal server error");
  }
};

export const controller_user_checkToken_post = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { token }: { token: string } = req.body;
  try {
    const valid = await jwtValidator(token);
    res.send(valid);
  } catch (error) {
    res.status(StatusCode.ClientErrorUnauthorized).send("token is invalid");
  }
};

export const controller_user_getInfo_get = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = req.user as { nanoId: string };
    if (user) {
      const result = await repository_user_getByNanoId(user.nanoId);
      res.send(omit(result, ["password"]));
    } else {
      res
        .status(StatusCode.ClientErrorBadRequest)
        .send("there is not a user in request");
    }
  } catch (error) {
    returnErrorResponse(res, 500, error);
  }
};

const loginService = async (
  userName: string,
  password: string
): Promise<{
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: number;
  refreshTokenExpiresAt: number;
}> => {
  const user = await repository_user_getByPhoneNumber(userName);
  if (user) {
    const samePass = await compare(password, user.password);
    if (!samePass) {
      throw new Error("username or password is wrong");
    }
    return generateTokens({
      authority: user.authorities,
      nanoId: user.nanoId,
      admin: user.isAdmin,
    });
  }
  throw new Error("username or password is wrong");
};

export const returnErrorResponse = (
  res: Response,
  code: number = 500,
  error: { message?: string },
  defaultMessage: string = "can not get data"
): void => {
  res.status(code).end(error?.message ?? defaultMessage);
};
