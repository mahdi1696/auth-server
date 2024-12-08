import { sign, verify } from "jsonwebtoken";
import { repository_user_setRefreshToken } from "../../repository/user.repository";

type Payload = {
  nanoId: string;
  admin?: boolean;
  authority: string;
};

export const jwtTokenGenerator = (payload: Payload): Promise<string> => {
  return new Promise((res, rej) => {
    sign(
      payload,
      privateKey,
      //{ expiresIn: "15s", algorithm: "RS256" },
      { expiresIn: "1m", algorithm: "RS256" },
      (err, encode) => {
        if (err) {
          return rej(err);
        }
        res(encode);
      }
    );
  });
};

export const refreshTokenGenerator = (payload: Payload): Promise<string> => {
  return new Promise((res, rej) => {
    sign(
      payload,
      privateKey,
      //{ expiresIn: "30s", algorithm: "RS256" }, // Refresh token valid for 7 days
      { expiresIn: "2m", algorithm: "RS256" }, // Refresh token valid for 7 days
      (err, encode) => {
        if (err) {
          return rej(err);
        }
        res(encode);
      }
    );
  });
};

export const jwtValidator = (token: string): Promise<Payload> => {
  return new Promise((res, rej) => {
    verify(token, publicKey, { algorithms: ["RS256"] }, (err, decoded) => {
      if (err) {
        return rej(err);
      }
      res(decoded as Payload);
    });
  });
};

export const refreshTokenValidator = (
  refreshToken: string
): Promise<Payload> => {
  return new Promise((res, rej) => {
    verify(
      refreshToken,
      publicKey,
      { algorithms: ["RS256"] },
      (err, decoded) => {
        if (err) {
          return rej(err);
        }
        res(decoded as Payload);
      }
    );
  });
};

export const generateTokens = async (
  payload: Payload
): Promise<{
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: number;
  refreshTokenExpiresAt: number;
}> => {
  const accessToken = await jwtTokenGenerator(payload);
  const refreshToken = await refreshTokenGenerator(payload);
  const accessTokenExpiresAt = new Date(Date.now() + 15 * 1000).getTime();
  const refreshTokenExpiresAt = new Date(Date.now() + 30 * 1000).getTime();

  await repository_user_setRefreshToken(payload.nanoId, refreshToken);
  return {
    accessToken,
    refreshToken,
    accessTokenExpiresAt,
    refreshTokenExpiresAt,
  };
};

// When a refresh token is sent, validate and issue a new access token:
export const refreshAccessToken = async (
  refreshToken: string
): Promise<string> => {
  const decoded = await refreshTokenValidator(refreshToken);
  const newAccessToken = await jwtTokenGenerator(decoded);

  return newAccessToken;
};

//yes absolutely it must be in environment variable
const privateKey = `-----BEGIN RSA PRIVATE KEY-----
MIIBPAIBAAJBANODHyKv7BgKW52bRtzK5QQAyeHF+rYjFimSxtC/q1LMO3MlaH/e
aKdAzayjSrzr+3rSVsQtxCiCE45ORrxrmikCAwEAAQJBALfjneQ4ctkL2E8UOu2m
8KkkTmCeEbTcmF4YoAXJPhhCpyVeX0cJHkl8sqLMice70L/Iwg7RlfXco/hDVdR7
f6ECIQDp/LNQ7p0+9O9VRbYHm2JQVghmHPYfQ2C8WLxJ8iQnpQIhAOdpI8JERTWn
cyhyk4a0NTUpCpgwTJrTBVmq1vaHHME1AiEAqjB3bMJh9UzKV8egot/OHoi1CzC9
g/fKALS6Hz7UNVECIQCiJngaDgB5AiadNvvMrcWCxIlZ7q4e5rKfDCiogjBR6QIg
JrJpMQbyaVSoWNPaLDqyRNRADyI13tKuP/A95RvjCzs=
-----END RSA PRIVATE KEY-----`;

const publicKey = `-----BEGIN PUBLIC KEY-----
MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBANODHyKv7BgKW52bRtzK5QQAyeHF+rYj
FimSxtC/q1LMO3MlaH/eaKdAzayjSrzr+3rSVsQtxCiCE45ORrxrmikCAwEAAQ==
-----END PUBLIC KEY-----`;
