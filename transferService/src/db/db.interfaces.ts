export interface DBEntry {
    uid: string;
    email: string;
    action: Action;
    amount: string;
    date: number;
}

export enum Action {
    deposit = 'deposit',
    withdraw = 'withdraw'
}

export interface DBObject {
    [k: string]: DBEntry
}