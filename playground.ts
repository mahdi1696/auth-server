import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";

const generatePass = (pass: string) => {
  const salt = bcrypt.genSaltSync(12);
  const hash = bcrypt.hashSync(pass, salt);
  return hash;
};

console.log(generatePass("123456"));
