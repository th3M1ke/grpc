import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { grpcClientOptions } from '../grpc-client.options';
import { TransferController } from './transfer.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'TRANSFER_PACKAGE',
        ...grpcClientOptions,
      },
    ]),
  ],
  controllers: [TransferController],
})
export class TransferModule {}
