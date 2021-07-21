import {AuthenticationStrategy} from '@loopback/authentication';
import {repository} from '@loopback/repository';
import {Request} from '@loopback/rest';
import {UserProfile} from '@loopback/security';
import {UserRepository} from '../repositories';
import {AuthService} from '../services/auth.service';


export class UserTokenStrategy implements AuthenticationStrategy {

  // nombre de la strategia de autentificación
  public name: string = 'AdminTokenStrategy';
  // objeto de tipo 'AuthService'
  private authService: AuthService;


  constructor(
    // repositorio de tipo 'UserRepository'
    @repository(UserRepository)
    public userRepository: UserRepository,
  ) {
    // creación de instancia del objeto de tipo 'AuthService'
    this.authService = new AuthService(userRepository);
  }

  // metodo de athenticación, devuelve un UserProfile
  async authenticate(req: Request): Promise<UserProfile> {
    // extrae el token de la petición
    const token = await this.authService.extractToken(req);
    // verifica si el token y el rol sean válido, y guarda un 'UserProfile' con sus datos
    const userProfile = await this.authService.VerifyToken(token, 2);
    // retorna el 'userProfile'
    return userProfile;
  }

}
