export interface User {
    Name: string;
    Account: string;
}

export interface Transaction {
    id: string;
    sender: {
        name: string;
        account: string;
    };
    receiver: {
        name: string;
        account: string;
    };
    amount_with_currency: string;
    amount: number;
    currency: string;
    cause: string;
    created_at_time: number;
    is_topup: boolean;
    is_outgoing_transfer: boolean;
}