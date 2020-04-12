import { v4 as uuidv4 } from 'uuid';
import {
    DBEntry, DBObject, FullDBObject, ModifyEntryObject
} from './db.interfaces';
import { UserDto } from '../user/user.interfaces';
import { BehaviorSubject } from 'rxjs';

interface DBSubject {
    [k: string]: BehaviorSubject<FullDBObject>
}

class DB {
    private db: DBObject  = {};
    private DB$: DBSubject = {};

    findByUid(uid: string): FullDBObject | undefined {
        return this.db[uid] ? { ...this.db[uid], uid } : undefined;
    };

    findByEmailAndUid(uid: string, email: string,): FullDBObject | undefined {
        if(this.db[uid] && this.db[uid].email === email) {
            return { ...this.db[uid], uid };
        }
    }

    addUser(user: UserDto): FullDBObject {
        const userFromDb = Object.values(this.db).find(entry => entry.email === user.email);

        if(userFromDb) {
            throw new Error(`User with email: ${user.email} already exists`);
        }

        const uid = uuidv4();

        this.db[uid] = {
            ...user,
            amount: 1000000000
        };

        const response = { ...this.db[uid], uid};

        this.DB$[uid] = new BehaviorSubject(response);

        return response;
    }

    delUser(uid: string): ModifyEntryObject {
        if(this.db[uid] === undefined){
            return { rows: 0 };
        }

        delete(this.db[uid]);

        this.DB$[uid].complete();
        delete(this.DB$[uid]);

        return { rows: 1 };
    }

    editUser(uid: string, user: Partial<DBEntry>) {
        if(this.db[uid] === undefined){
            return { rows: 0 };
        }

        this.db[uid] = {
            ...this.db[uid],
            ...user
        }

        this.DB$[uid].next({ ...this.db[uid], uid });

        return { rows: 1 };
    }

    getUserSubject(uid: string): BehaviorSubject<FullDBObject> {
        return this.DB$[uid];
    }
}

export default new DB();