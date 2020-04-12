import { FullDBObject } from '../db/db.interfaces';

export interface UserDto {
    email: string;
    password: string;
}

export interface FullUserObject extends FullDBObject {}

export interface UserByUid {
    uid: string;
}