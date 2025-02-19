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
import { vehicles, customers } from '../storage/schema';

@Injectable()
export class VehicleService {
  constructor(@Inject('DB') private readonly db: DatabasePg) {}

  public async getVehicles() {
    return await this.db
      .select({
        id: vehicles.id,
        customerId: vehicles.customerId,
        make: vehicles.make,
        model: vehicles.model,
        year: vehicles.year,
        vin: vehicles.vin,
        registrationNumber: vehicles.registrationNumber,
        createdAt: vehicles.createdAt,
        updatedAt: vehicles.updatedAt,
        archivedAt: vehicles.archivedAt,
        firstName: sql<string>`lower(${customers.firstName})`,
        lastName: sql<string>`lower(${customers.lastName})`,
        email: sql<string>`lower(${customers.email})`,
        phoneNumber: sql<string>`lower(${customers.phoneNumber})`,
      })
      .from(vehicles)
      .leftJoin(customers, eq(vehicles.customerId, customers.id));
  }

  public async getVehicleById(id: string) {
    const [vehicle] = await this.db
      .select({
        id: vehicles.id,
        customerId: vehicles.customerId,
        make: vehicles.make,
        model: vehicles.model,
        year: vehicles.year,
        vin: vehicles.vin,
        registrationNumber: vehicles.registrationNumber,
        createdAt: vehicles.createdAt,
        updatedAt: vehicles.updatedAt,
        archivedAt: vehicles.archivedAt,
        firstName: sql<string>`lower(${customers.firstName})`,
        lastName: sql<string>`lower(${customers.lastName})`,
        email: sql<string>`lower(${customers.email})`,
        phoneNumber: sql<string>`lower(${customers.phoneNumber})`,
      })
      .from(vehicles)
      .leftJoin(customers, eq(vehicles.customerId, customers.id))
      .where(eq(vehicles.id, id));

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    return vehicle;
  }

  public async getVehiclesByCustomerId(customerId: string) {
    return await this.db
      .select()
      .from(vehicles)
      .where(eq(vehicles.customerId, customerId));
  }

  public async updateVehicle(
    id: string,
    data: Partial<{
      make: string;
      model: string;
      year: string;
      vin: string;
      registrationNumber: string;
    }>,
  ) {
    const [existingVehicle] = await this.db
      .select()
      .from(vehicles)
      .where(eq(vehicles.id, id));

    if (!existingVehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    if (data.vin) {
      const [vehicleWithVin] = await this.db
        .select()
        .from(vehicles)
        .where(eq(vehicles.vin, data.vin));

      if (vehicleWithVin && vehicleWithVin.id !== id) {
        throw new ConflictException('Vehicle with this VIN already exists');
      }
    }

    if (data.registrationNumber) {
      const [vehicleWithRegNumber] = await this.db
        .select()
        .from(vehicles)
        .where(eq(vehicles.registrationNumber, data.registrationNumber));

      if (vehicleWithRegNumber && vehicleWithRegNumber.id !== id) {
        throw new ConflictException(
          'Vehicle with this registration number already exists',
        );
      }
    }

    const [updatedVehicle] = await this.db
      .update(vehicles)
      .set(data)
      .where(eq(vehicles.id, id))
      .returning();

    return updatedVehicle;
  }

  public async deleteVehicle(id: string) {
    const [deletedVehicle] = await this.db
      .delete(vehicles)
      .where(eq(vehicles.id, id))
      .returning();

    if (!deletedVehicle) {
      throw new HttpException('Vehicle not found', HttpStatus.NOT_FOUND);
    }
  }

  public async createVehicle(data: {
    customerId: UUIDType;
    make: string;
    model: string;
    year: string;
    vin: string;
    registrationNumber: string;
  }) {
    const [vehicleWithVin] = await this.db
      .select()
      .from(vehicles)
      .where(eq(vehicles.vin, data.vin));

    if (vehicleWithVin) {
      throw new ConflictException('Vehicle with this VIN already exists');
    }

    const [vehicleWithRegNumber] = await this.db
      .select()
      .from(vehicles)
      .where(eq(vehicles.registrationNumber, data.registrationNumber));

    if (vehicleWithRegNumber) {
      throw new ConflictException(
        'Vehicle with this registration number already exists',
      );
    }

    return await this.db.transaction(async (trx) => {
      const [createdVehicle] = await trx
        .insert(vehicles)
        .values(data)
        .returning();

      return createdVehicle;
    });
  }
}
