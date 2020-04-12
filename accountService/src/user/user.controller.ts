import { Controller, Inject, OnModuleInit } from '@nestjs/common';
import {
  ClientGrpc,
  GrpcMethod,
  GrpcStreamMethod,
  RpcException,
} from '@nestjs/microservices';
import { Observable, Subject } from 'rxjs';
import { UserDto, FullUserObject, UserByUid } from './user.interfaces';
import db from '../db/db';

interface HelloRequest {
  greeting: string;
}

interface HelloResponse {
  reply: string;
}

interface UserService {
  addUser(data: UserDto): Observable<FullUserObject>;
  getUser(upstream: Observable<UserByUid>): Observable<FullUserObject>;
  bidiHello(upstream: Observable<HelloRequest>): Observable<HelloResponse>;
}

@Controller('user')
export class UserController implements OnModuleInit {

  private userService: UserService;

  constructor(@Inject('USER_PACKAGE') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.userService = this.client.getService<UserService>('UserService');
  }

  @GrpcMethod('UserService', 'getUser')
  getUser(data: UserByUid): FullUserObject {
    const user = db.findByUid(data.uid);

    if(user === undefined) {
      throw new RpcException('Can not find user.');
    }

    return user;
  }

  @GrpcMethod('UserService', 'addUser')
  addUser(data: UserDto): FullUserObject {
    try {
      return db.addUser(data);
    } catch (error) {
      console.log('error: ', error);
      throw new RpcException(error);
    }
  }

  @GrpcStreamMethod('UserService', 'getUserStream')
  getUserStream(data$: Observable<UserByUid>): Observable<FullUserObject> {
    const user$ = new Subject<FullUserObject>();

    data$.subscribe(
      function onNext(userUid: UserByUid){
        const user = db.findByUid(userUid.uid);

        if(user === undefined) {
          return user$.next({
            uid:'',
            amount: 0,
            email: '',
            password: ''
          });

        }

        user$.next(user);
      },
      function onError(error) {
        console.log('onError: ', error);
        throw new RpcException(error);
      },
      function onComplete() {
        console.log('Complete!');
        user$.complete();
      });

    return user$.asObservable();
  }

  @GrpcMethod('UserService', 'watchUser')
  watchUser(data: UserByUid): Observable<FullUserObject> {
    const user = db.findByUid(data.uid);

    if(user === undefined) {
      throw new RpcException('Can not find user.');
    }

    return db.getUserSubject(data.uid);
  }
}
