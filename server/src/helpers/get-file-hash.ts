const getFileHash = (data: ArrayBuffer) => {
  const hasher = new Bun.CryptoHasher('sha256');

  hasher.update(data);

  return hasher.digest('hex');
};

export { getFileHash };
