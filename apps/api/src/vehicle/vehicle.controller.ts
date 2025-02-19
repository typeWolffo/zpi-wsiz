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
import { VehicleService } from './vehicle.service';
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from 'drizzle-typebox';
import { vehicles, customers } from 'src/storage/schema';
import { InferInsertModel, InferSelectModel } from 'drizzle-orm';

const vehicleSelectSchema = createSelectSchema(vehicles);
const customerSelectSchema = createSelectSchema(customers);
const mergedSchema = Type.Intersect([
  vehicleSelectSchema,
  customerSelectSchema,
]);
const vehicleInsertSchema = createInsertSchema(vehicles);
const vehicleUpdateSchema = createUpdateSchema(vehicles);

type TVehicleSelect = InferSelectModel<typeof vehicles>;
type TCustomerSelect = InferSelectModel<typeof customers>;
type TMergedSelect = TVehicleSelect & Partial<TCustomerSelect>;
type TVehicleInsert = InferInsertModel<typeof vehicles>;
type TVehicleUpdate = Partial<InferInsertModel<typeof vehicles>>;

@Controller('vehicle')
@UseGuards(RolesGuard)
export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) {}

  @Get('all')
  @Roles(USER_ROLES.ADMIN, USER_ROLES.EMPLOYEE)
  @Validate({
    response: baseResponse(Type.Array(mergedSchema)),
  })
  async getVehicles(): Promise<BaseResponse<TMergedSelect[]>> {
    const vehicles = await this.vehicleService.getVehicles();
    return new BaseResponse(vehicles);
  }

  @Get(':id')
  @Roles(USER_ROLES.ADMIN, USER_ROLES.EMPLOYEE)
  @Validate({
    request: [
      { type: 'param', name: 'id', schema: UUIDSchema, required: true },
    ],
    response: baseResponse(mergedSchema),
  })
  async getVehicleById(
    @Param('id') id: string,
  ): Promise<BaseResponse<TMergedSelect>> {
    const vehicle = await this.vehicleService.getVehicleById(id);
    return new BaseResponse(vehicle);
  }

  @Get('customer/:customerId')
  @Roles(USER_ROLES.ADMIN, USER_ROLES.EMPLOYEE)
  @Validate({
    request: [
      { type: 'param', name: 'customerId', schema: UUIDSchema, required: true },
    ],
    response: baseResponse(Type.Array(vehicleSelectSchema)),
  })
  async getVehiclesByCustomerId(
    @Param('customerId') customerId: string,
  ): Promise<BaseResponse<TVehicleSelect[]>> {
    const vehicles =
      await this.vehicleService.getVehiclesByCustomerId(customerId);
    return new BaseResponse(vehicles);
  }

  @Patch(':id')
  @Roles(USER_ROLES.ADMIN, USER_ROLES.EMPLOYEE)
  @Validate({
    response: baseResponse(vehicleSelectSchema),
    request: [
      { type: 'param', name: 'id', schema: UUIDSchema, required: true },
      { type: 'body', schema: vehicleUpdateSchema },
    ],
  })
  async updateVehicle(
    @Param('id') id: UUIDType,
    @Body() data: TVehicleUpdate,
  ): Promise<BaseResponse<TVehicleSelect>> {
    const updatedVehicle = await this.vehicleService.updateVehicle(id, data);
    return new BaseResponse(updatedVehicle);
  }

  @Delete(':id')
  @Roles(USER_ROLES.ADMIN)
  @Validate({
    response: nullResponse(),
    request: [
      { type: 'param', name: 'id', schema: UUIDSchema, required: true },
    ],
  })
  async deleteVehicle(@Param('id') id: string): Promise<null> {
    await this.vehicleService.deleteVehicle(id);
    return null;
  }

  @Post()
  @Roles(USER_ROLES.ADMIN, USER_ROLES.EMPLOYEE)
  @Validate({
    response: baseResponse(
      Type.Object({ id: UUIDSchema, message: Type.String() }),
    ),
    request: [{ type: 'body', schema: vehicleInsertSchema }],
  })
  async createVehicle(
    @Body() data: TVehicleInsert,
  ): Promise<BaseResponse<{ id: UUIDType; message: string }>> {
    const { id } = await this.vehicleService.createVehicle(data);
    return new BaseResponse({
      id,
      message: 'Vehicle created successfully',
    });
  }
}
