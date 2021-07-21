// Uncomment these imports to begin using these cool features!

import {model, property, repository} from '@loopback/repository';
import {HttpErrors, post, requestBody} from '@loopback/rest';
import {UserRepository} from '../repositories';
import {AuthService} from '../services/auth.service';

// import {inject} from '@loopback/core';

@model()
export class Credentials {
  @property()
  userName: string;
  @property()
  password: string;
}

export class UserController {

  private authService: AuthService;

  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
  ) {
    this.authService = new AuthService(userRepository);
  }

  @post('/login', {
    responses: {
      '200': {
        description: 'Login for customer'
      }
    }
  })
  async login(
    @requestBody({
      description: 'Credentials',
      required: true
    }) credentials: Credentials,
  ): Promise<Object> {

    const user = await this.authService.Identify(credentials.userName, credentials.password);

    if (user) {
      const token = await this.authService.GenerateToken(user);
      return {
        data: user,
        token
      }
    }

    throw new HttpErrors[401]('User or password invalid.');
  }
}
