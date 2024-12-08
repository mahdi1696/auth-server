import { Router } from "express";
import {
  controller_user_generateAccessTokenByRefreshToken_post,
  controller_user_checkToken_post,
  controller_user_getInfo_get,
  controller_user_loginCookie_post,
  controller_user_getSessionWithRefreshToken_get,
} from "../controllers/userController";
import { authenticationAndAuthorization } from "../service/authentication/authentication";
const router = Router();

router.post("/loginCookie", controller_user_loginCookie_post);

router.post(
  "/refreshToken",
  controller_user_generateAccessTokenByRefreshToken_post
);

router.post("/checkAccessToken", controller_user_checkToken_post);

router.get(
  "/getSessionWithRefreshToken",
  authenticationAndAuthorization("customer", "0"),
  controller_user_getSessionWithRefreshToken_get
);

router.get(
  "/getUserInfo",
  authenticationAndAuthorization("customer", "0"),
  controller_user_getInfo_get
);
export default router;
