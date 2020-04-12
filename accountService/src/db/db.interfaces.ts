export interface DBEntry {
    email: string;
    password: string;
    amount: number;
}

export interface DBObject {
    [k: string]: DBEntry
}

export interface FullDBObject extends DBEntry {
    uid: string;
}

export interface ModifyEntryObject {
    rows: number;
}
