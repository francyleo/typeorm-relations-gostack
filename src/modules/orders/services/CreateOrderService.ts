import Customer from '@modules/customers/infra/typeorm/entities/Customer';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Product from '@modules/products/infra/typeorm/entities/Product';
import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import AppError from '@shared/errors/AppError';
import { inject, injectable } from 'tsyringe';
import OrdersProducts from '../infra/typeorm/entities/OrdersProducts';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IRequest {
  customer_id: string;
  products: Product[];
}

interface IResponse {
  customer: Customer;
  order_products: OrdersProducts[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,

    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,

    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({
    customer_id,
    products,
  }: IRequest): Promise<IResponse> {
    const customerExists = await this.customersRepository.findById(customer_id);

    if (!customerExists) {
      throw new AppError('Customer is not exists', 400);
    }

    const existentProducts = await this.productsRepository.findAllById(
      products,
    );

    if (!existentProducts.length) {
      throw new AppError('Product is not exists');
    }

    const existentProductsIds = existentProducts.map(product => product.id);

    const checkInexistentProducts = products.filter(
      product => !existentProductsIds.includes(product.id),
    );

    if (checkInexistentProducts.length) {
      const { id } = checkInexistentProducts[0];

      throw new AppError(`Could not find product ${id}`);
    }

    const findProductsWithNoQuantityAvaliable = products.filter(
      product =>
        existentProducts.filter(p => p.id === product.id)[0].quantity <
        product.quantity,
    );

    if (findProductsWithNoQuantityAvaliable.length) {
      const { quantity, id, name } = findProductsWithNoQuantityAvaliable[0];

      throw new AppError(
        `The quantity ${quantity} is not available for ${id} - ${name}`,
      );
    }

    const serializedProducts = products.map(product => ({
      product_id: product.id,
      quantity: product.quantity,
      price: existentProducts.filter(p => p.id === product.id)[0].price,
    }));

    const order = await this.ordersRepository.create({
      customer: customerExists,
      products: serializedProducts,
    });

    const { order_products } = order;

    const orderedProductsQuantity = order_products.map(product => ({
      id: product.product_id,
      quantity:
        existentProducts.filter(p => p.id === product.product_id)[0].quantity -
        product.quantity,
    }));

    await this.productsRepository.updateQuantity(orderedProductsQuantity);

    return order;
  }
}

export default CreateOrderService;
