import OrdersProducts from '../infra/typeorm/entities/OrdersProducts';
import ICreateOrderProductsDTO from '../dtos/ICreateOrderProductsDTO';

export default interface IOrdersProductsRepository {
  create(data: ICreateOrderProductsDTO): Promise<OrdersProducts>;
  findById(id: string): Promise<OrdersProducts | undefined>;
}
