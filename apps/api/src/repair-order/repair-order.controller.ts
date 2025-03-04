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
import { RepairOrderService } from './repair-order.service';
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from 'drizzle-typebox';
import { repairOrders } from 'src/storage/schema';

const repairOrderSelectBaseSchema = createSelectSchema(repairOrders);
const repairOrderSelectSchema = Type.Composite([
  repairOrderSelectBaseSchema,
  Type.Object({
    make: Type.String(),
    model: Type.String(),
    year: Type.String(),
    vin: Type.String(),
    registrationNumber: Type.String(),
    customerFirstName: Type.String(),
    customerLastName: Type.String(),
    customerEmail: Type.String(),
    customerPhoneNumber: Type.String(),
  }),
]);
const repairOrderInsertSchema = createInsertSchema(repairOrders);
const repairOrderUpdateSchema = createUpdateSchema(repairOrders);

@Controller('repair-order')
@UseGuards(RolesGuard)
export class RepairOrderController {
  constructor(private readonly repairOrderService: RepairOrderService) {}

  @Get('all')
  @Roles(USER_ROLES.ADMIN, USER_ROLES.EMPLOYEE)
  @Validate({
    response: baseResponse(Type.Array(repairOrderSelectSchema)),
  })
  async getRepairOrders() {
    const repairOrders = await this.repairOrderService.getRepairOrders();
    return new BaseResponse(repairOrders);
  }

  @Get(':id')
  @Roles(USER_ROLES.ADMIN, USER_ROLES.EMPLOYEE)
  @Validate({
    request: [
      { type: 'param', name: 'id', schema: UUIDSchema, required: true },
    ],
    response: baseResponse(repairOrderSelectSchema),
  })
  async getRepairOrderById(@Param('id') id: string) {
    const repairOrder = await this.repairOrderService.getRepairOrderById(id);
    return new BaseResponse(repairOrder);
  }

  @Patch(':id')
  @Roles(USER_ROLES.ADMIN, USER_ROLES.EMPLOYEE)
  @Validate({
    response: baseResponse(repairOrderUpdateSchema),
    request: [
      { type: 'param', name: 'id', schema: UUIDSchema, required: true },
      { type: 'body', schema: repairOrderUpdateSchema },
    ],
  })
  async updateRepairOrder(
    @Param('id') id: UUIDType,
    @Body()
    data: {
      description?: string;
      assignedMechanicId?: UUIDType | null;
      vehicleId?: UUIDType | null;
      startDate?: string;
      endDate?: string;
    },
  ) {
    const updatedRepairOrder = await this.repairOrderService.updateRepairOrder(
      id,
      data,
    );
    return new BaseResponse(updatedRepairOrder);
  }

  @Delete(':id')
  @Roles(USER_ROLES.ADMIN)
  @Validate({
    response: nullResponse(),
    request: [
      { type: 'param', name: 'id', schema: UUIDSchema, required: true },
    ],
  })
  async deleteRepairOrder(@Param('id') id: string) {
    await this.repairOrderService.deleteRepairOrder(id);
    return null;
  }

  @Post()
  @Roles(USER_ROLES.ADMIN, USER_ROLES.EMPLOYEE)
  @Validate({
    response: baseResponse(
      Type.Object({ id: UUIDSchema, message: Type.String() }),
    ),
    request: [{ type: 'body', schema: repairOrderInsertSchema }],
  })
  async createRepairOrder(
    @Body()
    data: {
      description: string;
      assignedMechanicId?: UUIDType | null;
      vehicleId?: UUIDType | null;
      startDate: string;
      endDate: string;
    },
  ) {
    const { id } = await this.repairOrderService.createRepairOrder(data);
    return new BaseResponse({
      id,
      message: 'Repair order created successfully',
    });
  }
}
