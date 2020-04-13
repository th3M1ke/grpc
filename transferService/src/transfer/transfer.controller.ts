import { Controller, Inject, OnModuleInit } from '@nestjs/common';
import {
  ClientGrpc,
  GrpcMethod,
  RpcException,
  Client
} from '@nestjs/microservices';
import { Observable, Subject } from 'rxjs';
import { TransferDto, ResponseObject } from './transfer.interfaces';
import db from '../db/db';
import { Action } from 'src/db/db.interfaces';
import { grpcClientToAccountOptions } from '../grpc-client.options';

// import { Observable } from 'rxjs';

export interface IGrpcService {
  deposit(data: AccountTransferDto): AccountResponseObject;
  withdraw(data: AccountTransferDto): AccountResponseObject;
}

export interface AccountTransferDto {
  email: string;
  uid: string;
  amount: number;
}

export interface AccountResponseObject extends AccountTransferDto {}

interface TransferService {
  deposit(data: AccountTransferDto): ResponseObject;
  withdraw(data: AccountTransferDto): ResponseObject;
}

interface Mutex {
  [k: string]: boolean;
}

@Controller('transfer')
export class TransferController implements OnModuleInit {

  private transferService: TransferService;
  private mutex: Mutex = {};

  @Client(grpcClientToAccountOptions)
  private clientToAccount: ClientGrpc;

  private grpcService: IGrpcService;

  constructor(@Inject('TRANSFER_PACKAGE') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.transferService = this.client.getService<TransferService>('TransferService');
    this.grpcService = this.clientToAccount.getService<IGrpcService>('ATService');
  }

  @GrpcMethod('TransferService', 'deposit')
  deposit({uid, email, amount}: TransferDto): ResponseObject {
    if(this.mutex[`${uid}:${email}`] === true) {
      throw new RpcException('Transaction in progress.');
    }

    this.mutex[`${uid}:${email}`] = true;

    console.log('this.grpcService: ', this.grpcService);
    const response = this.grpcService.deposit({ email, uid, amount });

    console.log('response: ', response);

    db.logData(uid, email, Action.deposit, amount);

    this.mutex[`${uid}:${email}`] = false;

    return {
      uid,
      email,
      amount
    };
  }

  @GrpcMethod('TransferService', 'withdraw')
  withdraw({uid, email, amount}: TransferDto): ResponseObject {
    if(this.mutex[`${uid}:${email}`] === true) {
      throw new RpcException('Transaction in progress.');
    }

    this.mutex[`${uid}:${email}`] = true;

    const response = this.grpcService.withdraw({ email, uid, amount });

    db.logData(uid, email, Action.withdraw, amount);

    // if(user === undefined) {
    //   throw new RpcException('Can not find user.');
    // }

    // const currentAmount = user.amount - amount;

    // db.editUser(uid, { amount: currentAmount });

    this.mutex[`${uid}:${email}`] = false;

    return {
      uid,
      email,
      amount
    };
  }
}
