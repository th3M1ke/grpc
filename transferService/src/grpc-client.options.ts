import { ClientOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

export const grpcClientToAccountOptions: ClientOptions = {
  transport: Transport.GRPC,
  options: {
    package: ['transfer'],
    protoPath: [join(__dirname, '../../accountService/src/transfer/transfer.proto ')],
    url: 'localhost:5000',
  },
};


export const grpcClientOptions: ClientOptions = {
  transport: Transport.GRPC,
  options: {
    package: ['transfer'],
    protoPath: [join(__dirname, './transfer/transfer.proto')],
    url: '0.0.0.0:5001',
  },
};
