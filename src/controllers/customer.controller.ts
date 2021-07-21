import {authenticate} from '@loopback/authentication';
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where
} from '@loopback/repository';
import {
  del, get,
  getModelSchemaRef, param, patch, post, put, requestBody,
  response
} from '@loopback/rest';
import {Customer} from '../models';
import {CustomerRepository, UserRepository} from '../repositories';
import {EncryptDecrypt, KeyTypes as keys} from '../services/encrypt-decrypt.service';

export class CustomerController {
  constructor(
    @repository(CustomerRepository)
    public customerRepository: CustomerRepository,
    @repository(UserRepository)
    public userRepository: UserRepository,
  ) { }


  // crear cliente
  @post('/customer')
  @response(200, {
    description: 'Customer model instance',
    content: {'application/json': {schema: getModelSchemaRef(Customer)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Customer, {
            title: 'NewCustomer',
            exclude: ['id'],
          }),
        },
      },
    })
    customer: Omit<Customer, 'id'>,
  ): Promise<Customer> {
    // guardo un cliente en la base de datos y se lo asigno a la variable c
    let c = await this.customerRepository.create(customer);
    // encripta la clave
    const p = new EncryptDecrypt(keys.MD5).Encrypt(c.document);
    const p2 = new EncryptDecrypt(keys.MD5).Encrypt(p);
    // creó el usuario apartir de los datos del cliente
    let u = {
      userName: c.email,
      password: p2,
      customerId: c.id!
    }

    // guarda el usuario en la base de datos y se lo asigna a la variable user
    let user = await this.userRepository.create(u);
    // le quito la contraseña al usuario para enviarlo.
    user.password = '';
    // asigna el usuario al cliente
    c.user = user;

    // devuelve el cliente y su usuario
    return c;
  }

  // verifica la autenticaión antes de acceder al endpoint
  @authenticate('AdminTokenStrategy')
  // numero de clientes
  @get('/customer/count')
  @response(200, {
    description: 'Customer model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Customer) where?: Where<Customer>,
  ): Promise<Count> {
    return this.customerRepository.count(where);
  }


  // listado de clientes
  @authenticate('UserTokenStrategy')
  @get('/customer')
  @response(200, {
    description: 'Array of Customer model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Customer, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Customer) filter?: Filter<Customer>,
  ): Promise<Customer[]> {
    return this.customerRepository.find(filter);
  }

  // verifica la autenticaión antes de acceder al endpoint
  @authenticate('UserTokenStrategy')
  // actualizar uno o varios campos de los clientes que cumplan la condición
  @patch('/customer')
  @response(200, {
    description: 'Customer PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Customer, {partial: true}),
        },
      },
    })
    customer: Customer,
    @param.where(Customer) where?: Where<Customer>,
  ): Promise<Count> {
    return this.customerRepository.updateAll(customer, where);
  }

  // verifica la autenticaión antes de acceder al endpoint
  @authenticate('UserTokenStrategy')
  // busca un cliente por su id
  @get('/customer/{id}')
  @response(200, {
    description: 'Customer model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Customer, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Customer, {exclude: 'where'}) filter?: FilterExcludingWhere<Customer>
  ): Promise<Customer> {
    return this.customerRepository.findById(id, filter);
  }

  // verifica la autenticaión antes de acceder al endpoint
  @authenticate('UserTokenStrategy')
  // actualiza cualquier campo de un cliente por su id.
  @patch('/customer/{id}')
  @response(204, {
    description: 'Customer PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Customer, {partial: true}),
        },
      },
    })
    customer: Customer,
  ): Promise<void> {
    await this.customerRepository.updateById(id, customer);
  }

  // verifica la autenticaión antes de acceder al endpoint
  @authenticate('UserTokenStrategy')
  // actualiza un cliente por su id
  @put('/customer/{id}')
  @response(204, {
    description: 'Customer PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() customer: Customer,
  ): Promise<void> {
    // busca un usuario donde el customerId sea igual al id que viene en la petición
    let u = await this.userRepository.findOne({where: {customerId: id}});
    // valida que el usuario no este vacio.
    if (u) {
      // asignama el email al userName
      u.userName = customer.email;
      // actuliza el usuario con el nuemo userName
      await this.userRepository.replaceById(u.id, u);
    }
    // actualiza el cliente con los nuevos datos
    await this.customerRepository.replaceById(id, customer);
  }

  // verifica la autenticaión antes de acceder al endpoint
  @authenticate('AdminTokenStrategy')
  // elimina un cliente por su id
  @del('/customer/{id}')
  @response(204, {
    description: 'Customer DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.customerRepository.deleteById(id);
  }
}
