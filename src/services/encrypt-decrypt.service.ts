const cryptoJS = require('crypto-js');

export enum KeyTypes {
  MD5 = 'md5',
  AES = 'aes',
  SHA_512 = 'sha512',
  AES_SECRET_KEY = 'AES@SecretKey*'
}

export class EncryptDecrypt {

  private type: string;

  constructor(type: string) {
    this.type = type;
  }

  // metodo de encriptación: recibe un el texto y lo encripta segun el type definido.
  Encrypt(text: string): string {
    // realiza la encriptación segun se el tipo seleccionado (MD5, AES, SHA512)
    switch (this.type) {
      case KeyTypes.MD5:
        return cryptoJS.MD5(text).toString();
      case KeyTypes.AES:
        return cryptoJS.AES.Encrypt(text, KeyTypes.AES_SECRET_KEY).toString();
      case KeyTypes.SHA_512:
        return cryptoJS.SHA1(text).toString();
      default:
        return cryptoJS.MD5(text).toString();
    }
  }

}



