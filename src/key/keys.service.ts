// contiene las claves para la app
export namespace Keys {
  // clave secreta para firmar los token
  export const JWT_SECRET_KEY = 'JWT@SecretKey*';
  // tiempo de expiración de los token
  export const JWT_EXPIRATION_TIME = Math.floor((Date.now() / 100) * 3600);
}
