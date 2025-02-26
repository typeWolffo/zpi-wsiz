import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Type } from '@sinclair/typebox';
import { Validate } from 'nestjs-typebox';
import {
  baseResponse,
  BaseResponse,
  nullResponse,
  UUIDSchema,
  type UUIDType,
} from 'src/common';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { USER_ROLES } from 'src/user/schemas/userRoles';
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from 'drizzle-typebox';
import { customers } from 'src/storage/schema';
import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { CustomerService } from './customer.service';

const customerSelectSchema = createSelectSchema(customers);
const customerInsertSchema = createInsertSchema(customers);
const customerUpdateSchema = createUpdateSchema(customers);
type TCustomerSelect = InferSelectModel<typeof customers>;
export type TCustomerInsert = InferInsertModel<typeof customers>;
export type TCustomerUpdate = Partial<InferInsertModel<typeof customers>>;

@Controller('customer')
@UseGuards(RolesGuard)
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Get('all')
  @Roles(USER_ROLES.ADMIN, USER_ROLES.EMPLOYEE)
  @Validate({
    response: baseResponse(Type.Array(customerSelectSchema)),
  })
  async getCustomers(): Promise<BaseResponse<TCustomerSelect[]>> {
    const customers = await this.customerService.getCustomers();
    return new BaseResponse(customers);
  }

  @Get(':id')
  @Roles(USER_ROLES.ADMIN, USER_ROLES.EMPLOYEE)
  @Validate({
    request: [
      { type: 'param', name: 'id', schema: UUIDSchema, required: true },
    ],
    response: baseResponse(customerSelectSchema),
  })
  async getCustomerById(
    @Param('id') id: string,
  ): Promise<BaseResponse<TCustomerSelect>> {
    const customer = await this.customerService.getCustomerById(id);
    return new BaseResponse(customer);
  }

  @Patch(':id')
  @Roles(USER_ROLES.ADMIN, USER_ROLES.EMPLOYEE)
  @Validate({
    response: baseResponse(customerSelectSchema),
    request: [
      { type: 'param', name: 'id', schema: UUIDSchema, required: true },
      { type: 'body', schema: customerUpdateSchema },
    ],
  })
  async updateCustomer(
    @Param('id') id: UUIDType,
    @Body() data: TCustomerUpdate,
  ): Promise<BaseResponse<TCustomerSelect>> {
    const updatedCustomer = await this.customerService.updateCustomer(id, data);
    return new BaseResponse(updatedCustomer);
  }

  @Delete(':id')
  @Roles(USER_ROLES.ADMIN)
  @Validate({
    response: nullResponse(),
    request: [
      { type: 'param', name: 'id', schema: UUIDSchema, required: true },
    ],
  })
  async deleteCustomer(@Param('id') id: string): Promise<null> {
    await this.customerService.deleteCustomer(id);
    return null;
  }

  @Post()
  @Roles(USER_ROLES.ADMIN, USER_ROLES.EMPLOYEE)
  @Validate({
    response: baseResponse(
      Type.Object({ id: UUIDSchema, message: Type.String() }),
    ),
    request: [{ type: 'body', schema: customerInsertSchema }],
  })
  async createCustomer(
    @Body() data: TCustomerInsert,
  ): Promise<BaseResponse<{ id: UUIDType; message: string }>> {
    const { id } = await this.customerService.createCustomer(data);
    return new BaseResponse({
      id,
      message: 'Customer created successfully',
    });
  }
}
