// Uncomment these imports to begin using these cool features!

import {model, property, repository} from '@loopback/repository';
import {HttpErrors, post, requestBody} from '@loopback/rest';
import {UserRepository} from '../repositories';
import {AuthService} from '../services/auth.service';

// decorador para transformarlo en un modelo de loopback
@model()
// clase de tipo credentials para el manejo del login
export class Credentials {
  // decorador para que loopback lo lea como propiedad
  @property()
  userName: string;
  // decorador para que loopback lo lea como propiedad
  @property()
  password: string;
}

// controla todos los endpoint del usuario
export class UserController {

  // crea una propiedad de tipo AuthService
  private authService: AuthService;

  constructor(
    // una referencia de tipo userRepository para las operaciones crud
    @repository(UserRepository)
    public userRepository: UserRepository,
  ) {
    // instancia un objeto del tipo authService y le pasa el userRepository
    this.authService = new AuthService(userRepository);
  }

  // endpoint login
  @post('/login', {
    // tipo de respuesta
    responses: {
      '200': {
        // descricción de la respuesta
        description: 'Login for customer'
      }
    }
  })
  // método a ejecutar al acceder al endpoint
  async login(
    // configuracion del objeto de tipo body que recibirá el endpoint
    @requestBody({
      description: 'Credentials',
      required: true
    }) credentials: Credentials,
  ): Promise<Object> {
    // realiza una identificación de las credenciales y lo guarda en la constante user
    const user = await this.authService.Identify(credentials.userName, credentials.password);

    // verifica que el usuario obtenido se validó
    if (user) {
      // genera un token y lo almacena en la constante token
      const token = await this.authService.GenerateToken(user);
      // retorna un objeto con el token y los datos del usuario
      return {
        data: user,
        token
      }
    }

    // retorna un error en caso que los datos sean inválidos
    throw new HttpErrors[401]('User or password invalid.');
  }
}
