import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PayLoad } from '../auth/dto/PayLoad';
import { ORDER_TYPE } from 'src/common/enums';
import { AppAuthGuard } from '../auth/guards/appAuth.guard';
import { GetCurrentAppUser } from '../auth/guards/app-user.decorator';



@Controller('orders')
export class OrderController {
  constructor(
    private readonly orderService: OrderService
  ) { }

  @Get()
  async viewListOrders() {
    return this.orderService.findAll()
  }

  @Get('/:id')
  async viewOrderDetail(@Param("id") id: string) {
    return this.orderService.findOne(+id);
  }

  @UseGuards(AppAuthGuard)
  @Post("/app/buy")
  async buyStockOnApp(
    @Body() dto: CreateOrderDto,
    @GetCurrentAppUser() userFromToken: PayLoad,
  ) {

    if (dto['type'] != ORDER_TYPE.BUY) {
      throw new BadRequestException()
    }
    dto['user_id'] = userFromToken['id']

    return this.orderService.buyOnApp(dto)
  }

  @Post("/cms/buy")
  async buyStockOnCms(
    @Body() dto: CreateOrderDto,
  ) {
    if (dto['type'] != ORDER_TYPE.BUY) {
      throw new BadRequestException()
    }
    return this.orderService.buyOnCms(dto)
  }

  @Post("/cms/sell")
  async sellStockOnCms(
    @Body() dto: CreateOrderDto
  ) {
    if (dto['type'] != ORDER_TYPE.SELL) {
      throw new BadRequestException()
    }

    return this.orderService.sellOnCms(dto)
  }

  @UseGuards(AppAuthGuard)
  @Post("/app/sell")
  async sellStockOnApp(
    @Body() dto: CreateOrderDto,
    @GetCurrentAppUser() userFromToken: PayLoad
  ) {

    if (dto['type'] != ORDER_TYPE.SELL) {
      throw new BadRequestException()
    }

    dto['user_id'] = userFromToken['id']
    return this.orderService.sellOnApp(dto)
  }

  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.orderService.create(createOrderDto);
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
