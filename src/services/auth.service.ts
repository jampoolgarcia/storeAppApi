import {repository} from '@loopback/repository';
import {HttpErrors, Request} from '@loopback/rest';
import {securityId, UserProfile} from '@loopback/security';
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
        role: user.role
      }
      // firma el token con una clave secreta
    }, Keys.JWT_SECRET_KEY)
    // devuelve el token creado
    return token;
  }

  // extra el token de la petición request
  async extractToken(req: Request): Promise<string> {
    // comprueba si en el encabezado viene el apartado de autorización
    if (!req.headers.authorization)
      // dispara un error en el caso de que no lo posea
      throw new HttpErrors.Unauthorized(`No se encontró el encabezado de autorización.`);

    // guarda el valor de la autorización
    const authHeaderValue = req.headers.authorization;

    // verifica si el valor comienza con la palabra 'Bearer'
    if (!authHeaderValue.startsWith('Bearer'))
      // dispara un error en el caso de que no comience con 'Bearer'
      throw new HttpErrors.Unauthorized(`El encabezado de autorización no es del tipo 'Bearer'.`);

    // divide el valor en partes por espacios y lo guarda en un arreglo
    const parts = authHeaderValue.split(' ');

    // comprueba si las partes son diferentes a dos
    if (parts.length !== 2)
      // dispara un error en el caso de que no se cumpla el patron 'Bearer xx.yy.zz'
      throw new HttpErrors.Unauthorized(`El valor del encabezado de autorización tiene demasiadas partes. Debe seguir el patrón: 'Bearer xx.yy.zz' donde xx.yy.zz es un token JWT válido.`);

    // guarda el token que se encuentra en el segundo valor del arreglo 'parts'
    const token = parts[1];

    // devuelve el token
    return token;

  }

  // Verifica que el token y el rol sean validos, devuelve un 'UserProfile'
  async VerifyToken(token: string, role: number): Promise<UserProfile> {
    // realiza una prueba de codigo para haci poder capturar cualquier posible error
    try {

      // verifica el token, obtiene y almacena su data
      const data = jwt.verify(token, Keys.JWT_SECRET_KEY).data;

      // verifica que el usuario sea el rol que fue pasado como argumento
      if (data.role != role)
        // dispara un error en el caso que el rol no se de tipo usuario
        throw new HttpErrors.Unauthorized('Error el usuario no posee un rol valido.');

      // asigna un objeto de tipo 'UserProfile' con los datos obtenidos del token
      const userProfile: UserProfile = Object.assign(
        {[securityId]: '', name: ''},
        {
          [securityId]: data.id,
          name: data.name,
          id: data.id
        }
      )

      // retorna el userProfile
      return userProfile;

      // captura los errores
    } catch (err) {

      // dispara un error en el caso de que algo salga mal
      throw new HttpErrors.Unauthorized('Error al verificar el token.')
    }
  }

}
