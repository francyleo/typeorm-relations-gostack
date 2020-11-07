import { getRepository, Repository } from 'typeorm';

import IOrdersProductsRepository from '@modules/orders/repositories/IOrdersProductsRepository';
import ICreateOrderProductsDTO from '@modules/orders/dtos/ICreateOrderProductsDTO';
import OrdersProducts from '../entities/OrdersProducts';

class OrdersProductsRepository implements IOrdersProductsRepository {
  private ormRepository: Repository<OrdersProducts>;

  constructor() {
    this.ormRepository = getRepository(OrdersProducts);
  }

  public async create({
    order_id,
    product_id,
    price,
    quantity,
  }: ICreateOrderProductsDTO): Promise<OrdersProducts> {
    const orderProduct = await this.ormRepository.create({
      order_id,
      product_id,
      price,
      quantity,
    });

    await this.ormRepository.save(orderProduct);

    return orderProduct;
  }

  public async findById(id: string): Promise<OrdersProducts | undefined> {
    const orderProducts = await this.ormRepository.findOne(id);

    return orderProducts;
  }
}

export default OrdersProductsRepository;
