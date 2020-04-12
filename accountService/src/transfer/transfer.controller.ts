import { Controller, Inject, OnModuleInit } from '@nestjs/common';
import {
  ClientGrpc,
  GrpcMethod,
  GrpcStreamMethod,
  RpcException,
} from '@nestjs/microservices';
import { Observable, Subject } from 'rxjs';
import { TransferDto, ResponseObject } from './transfer.interfaces';
import db from '../db/db';

interface TransferService {
  deposit(data: TransferDto): ResponseObject;
  withdraw(data: TransferDto): ResponseObject;
}

interface Mutex {
  [k: string]: boolean;
}

@Controller('transfer')
export class TransferController implements OnModuleInit {

  private transferService: TransferService;
  private mutex: Mutex = {};

  constructor(@Inject('TRANSFER_PACKAGE') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.transferService = this.client.getService<TransferService>('TransferService');
  }

  @GrpcMethod('TransferService', 'deposit')
  deposit({uid, email, amount}: TransferDto): ResponseObject {
    if(this.mutex[`${uid}:${email}`] === true) {
      throw new RpcException('Transaction in progress.');
    }

    this.mutex[`${uid}:${email}`] = true;
    const user = db.findByEmailAndUid(uid, email);

    if(user === undefined) {
      throw new RpcException('Can not find user.');
    }

    const currentAmount = user.amount + amount;

    db.editUser(uid, { amount: currentAmount });

    this.mutex[`${uid}:${email}`] = false;

    return {
      uid,
      email,
      amount: currentAmount
    };
  }

  @GrpcMethod('TransferService', 'withdraw')
  withdraw({uid, email, amount}: TransferDto): ResponseObject {
    if(this.mutex[`${uid}:${email}`] === true) {
      throw new RpcException('Transaction in progress.');
    }

    this.mutex[`${uid}:${email}`] = true;

    const user = db.findByEmailAndUid(uid, email);

    if(user === undefined) {
      throw new RpcException('Can not find user.');
    }

    const currentAmount = user.amount - amount;

    db.editUser(uid, { amount: currentAmount });

    this.mutex[`${uid}:${email}`] = false;

    return {
      uid,
      email,
      amount: currentAmount
    };
  }
}
