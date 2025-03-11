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

import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from 'drizzle-typebox';
import {
  baseResponse,
  BaseResponse,
  nullResponse,
  UUIDSchema,
  type UUIDType,
} from 'src/common';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { mechanics, users } from 'src/storage/schema';
import { USER_ROLES } from 'src/user/schemas/userRoles';
import { MechanicService } from './mechanic.service';

const userSelectSchema = createSelectSchema(users);
const mechanicSelectSchema = createSelectSchema(mechanics);
const mergedSchema = Type.Intersect([userSelectSchema, mechanicSelectSchema]);
const mechanicInsertSchema = createInsertSchema(mechanics);
const mechanicUpdateSchema = createUpdateSchema(mechanics);
type TUserSelect = InferSelectModel<typeof users>;
type TMechanicSelect = InferSelectModel<typeof mechanics>;
type TMergedSelect = TUserSelect & TMechanicSelect;
type TMechanicInsert = InferInsertModel<typeof mechanics>;
type TMechanicUpdate = Partial<InferInsertModel<typeof mechanics>>;

@Controller('mechanic')
@UseGuards(RolesGuard)
export class MechanicController {
  constructor(private readonly mechanicService: MechanicService) {}

  @Get('all')
  @Roles(USER_ROLES.ADMIN, USER_ROLES.EMPLOYEE)
  @Validate({
    response: baseResponse(Type.Array(mergedSchema)),
  })
  async getMechanics(): Promise<BaseResponse<TMergedSelect[]>> {
    const mechanics = await this.mechanicService.getMechanics();

    return new BaseResponse(mechanics);
  }

  @Get(':id')
  @Roles(USER_ROLES.ADMIN, USER_ROLES.EMPLOYEE)
  @Validate({
    request: [
      { type: 'param', name: 'id', schema: UUIDSchema, required: true },
    ],
    response: baseResponse(mergedSchema),
  })
  async getMechanicById(
    @Param('id') id: string,
  ): Promise<BaseResponse<TMergedSelect>> {
    const mechanic = await this.mechanicService.getMechanicById(id);

    return new BaseResponse(mechanic);
  }

  @Patch(':id')
  @Roles(USER_ROLES.ADMIN)
  @Validate({
    response: baseResponse(mechanicSelectSchema),
    request: [
      { type: 'param', name: 'id', schema: UUIDSchema, required: true },
      { type: 'body', schema: mechanicUpdateSchema },
    ],
  })
  async updateMechanic(
    @Param('id') id: UUIDType,
    @Body() data: TMechanicUpdate,
  ): Promise<BaseResponse<TMechanicSelect>> {
    {
      const updatedUser = await this.mechanicService.updateMechanic(id, data);

      return new BaseResponse(updatedUser);
    }
  }

  @Delete(':id')
  @Roles(USER_ROLES.ADMIN)
  @Validate({
    response: nullResponse(),
    request: [
      { type: 'param', name: 'id', schema: UUIDSchema, required: true },
    ],
  })
  async deleteMechanic(@Param('id') id: string): Promise<null> {
    await this.mechanicService.deleteMechanic(id);

    return null;
  }

  @Post()
  @Roles(USER_ROLES.ADMIN)
  @Validate({
    response: baseResponse(
      Type.Object({ id: UUIDSchema, message: Type.String() }),
    ),
    request: [{ type: 'body', schema: mechanicInsertSchema }],
  })
  async createMechanic(
    @Body() data: TMechanicInsert,
  ): Promise<BaseResponse<{ id: UUIDType; message: string }>> {
    const { id } = await this.mechanicService.createMechanic(data);

    return new BaseResponse({
      id,
      message: 'User created successfully',
    });
  }
}
