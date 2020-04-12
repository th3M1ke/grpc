import { ClientOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

export const grpcClientOptions: ClientOptions = {
  transport: Transport.GRPC,
  options: {
    package: ['user', 'transfer'],
    protoPath: [join(__dirname, './user/user.proto'), join(__dirname, './transfer/transfer.proto')],
  },
};
