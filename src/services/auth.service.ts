import {repository} from '@loopback/repository';
import {Keys} from '../key/keys.service';
import {User} from '../models';
import {UserRepository} from '../repositories';
import {EncryptDecrypt, KeyTypes} from './encrypt-decrypt.service';
const jwt = require('jsonwebtoken');

export class AuthService {

  constructor(
    @repository(UserRepository)
    public userRespository: UserRepository,
  ) {

  }

  async Identify(userName: string, password: string): Promise<User | false> {
    const user = await this.userRespository.findOne({where: {userName: userName}});
    if (user) {
      const cryptPass = new EncryptDecrypt(KeyTypes.MD5).Encrypt(password);
      if (user.password == cryptPass) return user;
    }
    return false;
  }

  async GenerateToken(user: User): Promise<any> {
    user.password = '';
    const token = jwt.sign({
      exp: Keys.JWT_EXPIRATION_TIME,
      data: {
        _id: user.id,
        userName: user.userName,
        customer: user.customerId,
      }
    }, Keys.JWT_SECRET_KEY)

    return token;
  }

}
