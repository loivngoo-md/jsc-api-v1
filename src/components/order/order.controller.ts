import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PayLoad } from '../auth/dto/PayLoad';

export enum ORDER_TYPE {
  BUY = 'B',
  SELL = 'S',
}

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  async viewListOrders() {}

  async viewOrderDetail(id: number) {}

  async buyStockOnApp(
    dto: {
      stock_code: string;
      quantity: number;
      type?: ORDER_TYPE;
      amount?: number;
      before?: number;
      after?: number;
    },
    userFromToken: PayLoad,
  ) {}

  async sellStockOnCms() {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.orderService.create(createOrderDto);
  }

  @Get()
  findAll() {
    return this.orderService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.orderService.update(+id, updateOrderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.orderService.remove(+id);
  }
}
