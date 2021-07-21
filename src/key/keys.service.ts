export namespace Keys {
  export const JWT_SECRET_KEY = 'JWT@SecretKey*';
  export const JWT_EXPIRATION_TIME = Math.floor((Date.now() / 100) * 3600);
}
