import { Module } from '@nestjs/common';
import { TransferModule } from './transfer/transfer.module';

@Module({
  imports: [TransferModule],
})
export class AppModule {}
