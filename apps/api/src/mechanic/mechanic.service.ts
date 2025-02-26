import {
  ConflictException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';

import { DatabasePg, UUIDType } from 'src/common';

import { mechanics, users } from '../storage/schema';

@Injectable()
export class MechanicService {
  constructor(@Inject('DB') private readonly db: DatabasePg) {}

  public async getMechanics() {
    return await this.db
      .select({
        id: mechanics.id,
        userId: mechanics.userId,
        shiftStart: mechanics.shiftStart,
        shiftEnd: mechanics.shiftEnd,
        createdAt: mechanics.createdAt,
        updatedAt: mechanics.updatedAt,
        firstName: sql<string>`lower(${users.firstName})`,
        lastName: sql<string>`lower(${users.lastName})`,
        email: sql<string>`lower(${users.email})`,
        role: sql<string>`lower(${users.role})`,
        archivedAt: users.archivedAt,
      })
      .from(mechanics)
      .leftJoin(users, eq(mechanics.userId, users.id));
  }

  public async getMechanicById(id: string) {
    const [mechanic] = await this.db
      .select({
        id: mechanics.id,
        userId: mechanics.userId,
        shiftStart: mechanics.shiftStart,
        shiftEnd: mechanics.shiftEnd,
        createdAt: mechanics.createdAt,
        updatedAt: mechanics.updatedAt,
        firstName: sql<string>`lower(${users.firstName})`,
        lastName: sql<string>`lower(${users.lastName})`,
        email: sql<string>`lower(${users.email})`,
        role: sql<string>`lower(${users.role})`,
        archivedAt: users.archivedAt,
      })
      .from(mechanics)
      .leftJoin(users, eq(mechanics.userId, users.id))
      .where(eq(mechanics.id, id));

    if (!mechanic) {
      throw new NotFoundException('Mechanic not found');
    }

    return mechanic;
  }

  public async updateMechanic(
    id: string,
    data: {
      shiftStart?: string;
      shiftEnd?: string;
    },
  ) {
    const [existingMechanic] = await this.db
      .select()
      .from(mechanics)
      .where(eq(mechanics.id, id));

    if (!existingMechanic) {
      throw new NotFoundException('Mechanic not found');
    }

    const [updatedMechanic] = await this.db
      .update(mechanics)
      .set(data)
      .where(eq(mechanics.id, id))
      .returning();

    return updatedMechanic;
  }

  public async deleteMechanic(id: string) {
    const [deletedMechanic] = await this.db
      .delete(mechanics)
      .where(eq(mechanics.id, id))
      .returning();

    if (!deletedMechanic) {
      throw new HttpException('Mechanic not found', HttpStatus.NOT_FOUND);
    }
  }

  public async createMechanic(data: {
    userId: UUIDType;
    shiftStart: string;
    shiftEnd: string;
  }) {
    const [existingMechanic] = await this.db
      .select()
      .from(mechanics)
      .where(eq(mechanics.userId, data.userId));

    if (existingMechanic) {
      throw new ConflictException('Mechanic already exists');
    }

    return await this.db.transaction(async (trx) => {
      const [createdMechanic] = await trx
        .insert(mechanics)
        .values(data)
        .returning();

      return createdMechanic;
    });
  }
}
