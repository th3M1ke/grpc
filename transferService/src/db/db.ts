import {
    DBEntry
} from './db.interfaces';
import { Action } from './db.interfaces';

class DB {
    private db: DBEntry[]  = [];

    logData(uid: string, email: string, action: Action, amount: string, date: number) {
        this.db.push({ uid, email, action, amount, date: Date.now()})
    }
}

export default new DB();