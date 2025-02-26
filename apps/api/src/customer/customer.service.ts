import {
  ConflictException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DatabasePg, UUIDType } from 'src/common';
import { customers } from '../storage/schema';
import { TCustomerInsert, TCustomerUpdate } from './customer.controller';

@Injectable()
export class CustomerService {
  constructor(@Inject('DB') private readonly db: DatabasePg) {}

  public async getCustomers() {
    return await this.db.select().from(customers);
  }

  public async getCustomerById(id: string) {
    const [customer] = await this.db
      .select()
      .from(customers)
      .where(eq(customers.id, id));

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return customer;
  }

  public async updateCustomer(id: string, data: Partial<TCustomerUpdate>) {
    const [existingCustomer] = await this.db
      .select()
      .from(customers)
      .where(eq(customers.id, id));

    if (!existingCustomer) {
      throw new NotFoundException('Customer not found');
    }

    const [updatedCustomer] = await this.db
      .update(customers)
      .set(data)
      .where(eq(customers.id, id))
      .returning();

    return updatedCustomer;
  }

  public async deleteCustomer(id: string) {
    const [deletedCustomer] = await this.db
      .delete(customers)
      .where(eq(customers.id, id))
      .returning();

    if (!deletedCustomer) {
      throw new HttpException('Customer not found', HttpStatus.NOT_FOUND);
    }
  }

  public async createCustomer(data: TCustomerInsert) {
    const [existingCustomer] = await this.db
      .select()
      .from(customers)
      .where(eq(customers.email, data.email));

    if (existingCustomer) {
      throw new ConflictException('Customer with this email already exists');
    }

    return await this.db.transaction(async (trx) => {
      const [createdCustomer] = await trx
        .insert(customers)
        .values(data)
        .returning();

      return createdCustomer;
    });
  }
}
