import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { TransferModule } from './transfer/transfer.module';

@Module({
  imports: [UserModule, TransferModule],
})
export class AppModule {}
