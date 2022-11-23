import { ORDER_TYPE } from "../order.controller";

export class CreateOrderDto {
    stock_code: string;
    quantity: number;
    type?: ORDER_TYPE;
    amount?: number;
    before?: number;
    after?: number;
}
