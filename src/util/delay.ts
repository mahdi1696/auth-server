const delay = (timeout: number): Promise<number> => {
  return new Promise((res) => {
    setTimeout(() => {
      res(timeout);
    }, timeout);
  });
};

export default delay;
