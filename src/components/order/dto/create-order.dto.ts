import { ORDER_TYPE } from "src/common/enums";

export class CreateOrderDto {
    // stock_code: string;
    // quantity: number;
    // type: ORDER_TYPE;
    // amount?: number;
    // before?: number;
    // after?: number;
}

export class ClosePositionDto {
    position_id: string | number
    type: ORDER_TYPE
    user_id: number
    amount: number;
    quantity: number
}
