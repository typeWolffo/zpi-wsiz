import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';
import { DatabasePg, UUIDType } from 'src/common';
import { customers, repairOrders, vehicles } from '../storage/schema';

@Injectable()
export class RepairOrderService {
  constructor(@Inject('DB') private readonly db: DatabasePg) {}

  public async getRepairOrders() {
    return await this.db
      .select({
        id: repairOrders.id,
        createdAt: repairOrders.createdAt,
        updatedAt: repairOrders.updatedAt,
        archivedAt: repairOrders.archivedAt,
        description: repairOrders.description,
        assignedMechanicId: repairOrders.assignedMechanicId,
        vehicleId: repairOrders.vehicleId,
        startDate: repairOrders.startDate,
        endDate: repairOrders.endDate,
        // Vehicle data
        make: vehicles.make,
        model: vehicles.model,
        year: vehicles.year,
        vin: vehicles.vin,
        registrationNumber: vehicles.registrationNumber,
        // Customer data
        customerFirstName: sql<string>`lower(${customers.firstName})`,
        customerLastName: sql<string>`lower(${customers.lastName})`,
        customerEmail: sql<string>`lower(${customers.email})`,
        customerPhoneNumber: customers.phoneNumber,
      })
      .from(repairOrders)
      .leftJoin(vehicles, eq(repairOrders.vehicleId, vehicles.id))
      .leftJoin(customers, eq(vehicles.customerId, customers.id));
  }

  public async getRepairOrderById(id: string) {
    const [repairOrder] = await this.db
      .select({
        id: repairOrders.id,
        createdAt: repairOrders.createdAt,
        updatedAt: repairOrders.updatedAt,
        archivedAt: repairOrders.archivedAt,
        description: repairOrders.description,
        assignedMechanicId: repairOrders.assignedMechanicId,
        vehicleId: repairOrders.vehicleId,
        startDate: repairOrders.startDate,
        endDate: repairOrders.endDate,
        // Vehicle data
        make: vehicles.make,
        model: vehicles.model,
        year: vehicles.year,
        vin: vehicles.vin,
        registrationNumber: vehicles.registrationNumber,
        // Customer data
        customerFirstName: sql<string>`lower(${customers.firstName})`,
        customerLastName: sql<string>`lower(${customers.lastName})`,
        customerEmail: sql<string>`lower(${customers.email})`,
        customerPhoneNumber: customers.phoneNumber,
      })
      .from(repairOrders)
      .leftJoin(vehicles, eq(repairOrders.vehicleId, vehicles.id))
      .leftJoin(customers, eq(vehicles.customerId, customers.id))
      .where(eq(repairOrders.id, id));

    if (!repairOrder) {
      throw new NotFoundException('Repair order not found');
    }

    return repairOrder;
  }

  public async updateRepairOrder(
    id: string,
    data: {
      description?: string;
      assignedMechanicId?: UUIDType | null;
      vehicleId?: UUIDType | null;
      startDate?: string;
      endDate?: string;
    },
  ) {
    const [existingRepairOrder] = await this.db
      .select()
      .from(repairOrders)
      .where(eq(repairOrders.id, id));

    if (!existingRepairOrder) {
      throw new NotFoundException('Repair order not found');
    }

    const [updatedRepairOrder] = await this.db
      .update(repairOrders)
      .set(data)
      .where(eq(repairOrders.id, id))
      .returning();

    return updatedRepairOrder;
  }

  public async deleteRepairOrder(id: string) {
    const [deletedRepairOrder] = await this.db
      .delete(repairOrders)
      .where(eq(repairOrders.id, id))
      .returning();

    if (!deletedRepairOrder) {
      throw new NotFoundException('Repair order not found');
    }
  }

  public async createRepairOrder(data: {
    description: string;
    assignedMechanicId?: UUIDType | null;
    vehicleId?: UUIDType | null;
    startDate: string;
    endDate: string;
  }) {
    const [createdRepairOrder] = await this.db
      .insert(repairOrders)
      .values(data)
      .returning();

    return createdRepairOrder;
  }
}
