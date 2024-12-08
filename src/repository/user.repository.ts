import delay from "../util/delay";

export const repository_user_getByNanoId = async (
  nanoId: string
): Promise<Partial<User>> => {
  await delay(100);
  return repository.find((it) => it.nanoId === nanoId);
};

export const repository_user_getByPhoneNumber = async (
  phoneNumber: string
): Promise<Partial<User>> => {
  await delay(100);
  return repository.find((it) => it.phoneNumber === phoneNumber);
};

export const repository_user_setRefreshToken = async (
  nanoId: string,
  refreshToken: string
): Promise<Partial<User>> => {
  await delay(100);
  const user = repository.find((it) => it.nanoId === nanoId);
  if (user) {
    user.refreshToken = refreshToken;
  }
  return user;
};

interface User {
  id: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  nationalId: string;
  password: string;
  authorities: string;
  isAdmin: boolean;
  nanoId: string;
  token: string;
  verificationToken: string;
  refreshToken: string;
}

const repository: Partial<User>[] = [
  {
    id: 0,
    firstName: "firstName",
    lastName: "lastName",
    phoneNumber: "0935123456",
    nanoId: "sfdf34234s",
    isAdmin: true,
    authorities: "0",
    password: "$2a$12$Jp11zMzcesvb4TfU6alUWez.jCQtiLgoeiCkU92W5tYLbXDFLc9SO",//123456
  },
];
