import { DrizzlePostgresModule } from '@knaadh/nestjs-drizzle-postgres';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';

import { AuthModule } from './auth/auth.module';
import database from './common/configuration/database';
import emailConfig from './common/configuration/email';
import jwtConfig from './common/configuration/jwt';
import { EmailModule } from './common/emails/emails.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { StagingGuard } from './common/guards/staging.guard';
import * as schema from './storage/schema';
import { UserModule } from './user/user.module';
import { MechanicModule } from './mechanic/mechanic.module';
import { VehicleModule } from './vehicle/vehicle.module';
import { RepairOrderModule } from './repair-order/repair-order.module';
import { CustomerModule } from './customer/customer.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [database, jwtConfig, emailConfig],
      isGlobal: true,
    }),
    DrizzlePostgresModule.registerAsync({
      tag: 'DB',
      useFactory(configService: ConfigService) {
        console.log(configService.get<string>('database.url')!);
        return {
          postgres: {
            url: configService.get<string>('database.url')!,
          },
          config: {
            schema: { ...schema },
          },
        };
      },
      inject: [ConfigService],
    }),
    JwtModule.registerAsync({
      useFactory(configService: ConfigService) {
        return {
          secret: configService.get<string>('jwt.secret')!,
          signOptions: {
            expiresIn: configService.get<string>('jwt.expirationTime'),
          },
        };
      },
      inject: [ConfigService],
      global: true,
    }),
    AuthModule,
    UserModule,
    EmailModule,
    MechanicModule,
    VehicleModule,
    RepairOrderModule,
    CustomerModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: StagingGuard,
    },
  ],
})
export class AppModule {}
