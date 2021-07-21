import {repository} from '@loopback/repository';
import {Keys} from '../key/keys.service';
import {User} from '../models';
import {UserRepository} from '../repositories';
import {EncryptDecrypt, KeyTypes} from './encrypt-decrypt.service';
const jwt = require('jsonwebtoken');

// contiene todo lo que tenga que ver con la autenticación
export class AuthService {

  constructor(
    // una referencia de tipo userRepository para las operaciones crud
    @repository(UserRepository)
    public userRespository: UserRepository,
  ) {

  }

  // realiza la logica de login y devuelve un usuario o false en caso de ser invalido
  async Identify(userName: string, password: string): Promise<User | false> {
    // busca el usuario en la base de datos que coincida con el userName
    const user = await this.userRespository.findOne({where: {userName: userName}});
    // verifica si se obtuvo un usuario.
    if (user) {
      // encripta la contraseña que fue pasada como parametro.
      const cryptPass = new EncryptDecrypt(KeyTypes.MD5).Encrypt(password);
      // compara la contraseña con la del usuario y lo retorna si es igual.
      if (user.password == cryptPass) return user;
    }
    // retorna false en caso que no coincidan los datos
    return false;
  }

  // Genera un token unico con los datos del usuario
  async GenerateToken(user: User): Promise<any> {
    // asigna un valor vacio a la clave del usuario
    user.password = '';
    // crea un token con la libreria jwt y los datos del usuario
    const token = jwt.sign({
      // asigna el tiempo de expiración del token
      exp: Keys.JWT_EXPIRATION_TIME,
      // asigna los datos del usario en la propiedad data
      data: {
        _id: user.id,
        userName: user.userName,
        customer: user.customerId,
      }
      // firma el token con una clave secreta
    }, Keys.JWT_SECRET_KEY)
    // devuelve el token creado
    return token;
  }

}
