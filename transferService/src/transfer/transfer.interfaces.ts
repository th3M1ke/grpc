export interface TransferDto {
    email: string;
    uid: string;
    amount: number;
}

export interface ResponseObject extends TransferDto {}
