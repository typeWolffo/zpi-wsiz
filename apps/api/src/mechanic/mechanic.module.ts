import { Module } from '@nestjs/common';
import { MechanicController } from './mechanic.controller';
import { MechanicService } from './mechanic.service';

@Module({
  imports: [],
  controllers: [MechanicController],
  providers: [MechanicService],
  exports: [],
})
export class MechanicModule {}
