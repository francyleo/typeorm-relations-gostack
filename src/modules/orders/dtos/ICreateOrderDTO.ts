import Customer from '@modules/customers/infra/typeorm/entities/Customer';
import IProduct from '@modules/products/dtos/IProduct';

export default interface ICreateOrderDTO {
  customer: Customer;
  products: IProduct[];
}
