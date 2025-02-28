import { DrizzlePostgresModule } from '@knaadh/nestjs-drizzle-postgres';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';

import { AuthModule } from './auth/auth.module';
import awsConfig from './common/configuration/aws';
import database from './common/configuration/database';
import emailConfig from './common/configuration/email';
import jwtConfig from './common/configuration/jwt';
import redisConfig from './common/configuration/redis';
import s3Config from './common/configuration/s3';
import stripeConfig from './common/configuration/stripe';
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
      load: [
        database,
        jwtConfig,
        emailConfig,
        awsConfig,
        s3Config,
        stripeConfig,
        redisConfig,
      ],
      isGlobal: true,
    }),
    DrizzlePostgresModule.registerAsync({
      tag: 'DB',
      useFactory(configService: ConfigService) {
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
