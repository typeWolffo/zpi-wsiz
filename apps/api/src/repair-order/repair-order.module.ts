import { Module } from '@nestjs/common';
import { RepairOrderController } from './repair-order.controller';
import { RepairOrderService } from './repair-order.service';

@Module({
  imports: [],
  controllers: [RepairOrderController],
  providers: [RepairOrderService],
  exports: [RepairOrderService],
})
export class RepairOrderModule {}
