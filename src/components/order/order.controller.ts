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
import { ClosePositionDto, CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PayLoad } from '../auth/dto/PayLoad';
import { ORDER_TYPE } from 'src/common/enums';
import { AppAuthGuard } from '../auth/guards/appAuth.guard';
import { GetCurrentAppUser } from '../auth/guards/app-user.decorator';
import { CmsAuthGuard } from '../auth/guards/cmsAuth.guard';



@Controller('orders')
export class OrderController {
  constructor(
    private readonly _orderService: OrderService
  ) { }

  @UseGuards(CmsAuthGuard)
  @Get("/histories")
  async list_orders_by_user(
    id: number
    ) {
    return this._orderService.list_orders_by_user(id)
  }

  @Get()
  async viewListOrders() {
    return this._orderService.findAll()
  }

  @Get('/:id')
  async viewOrderDetail(@Param("id") id: string) {
    return this._orderService.findOne(+id);
  }

  // @UseGuards(AppAuthGuard)
  // @Post("/app/buy")
  // async buyStockOnApp(
  //   @Body() dto: CreateOrderDto,
  //   @GetCurrentAppUser() userFromToken: PayLoad,
  // ) {

  //   if (dto['type'] != ORDER_TYPE.BUY) {
  //     throw new BadRequestException()
  //   }
  //   dto['user_id'] = userFromToken['id']

  //   return this._orderService.buyOnApp(dto)
  // }

  // @Post("/cms/buy")
  // async buyStockOnCms(
  //   @Body() dto: CreateOrderDto,
  // ) {
  //   if (dto['type'] != ORDER_TYPE.BUY) {
  //     throw new BadRequestException()
  //   }
  //   return this._orderService.buyOnCms(dto)
  // }

  // @Post("/cms/sell")
  // async sellStockOnCms(
  //   @Param() position_id: string,
  // ) {
  //   return this._orderService.sellOnCms(position_id)
  // }

  // @UseGuards(AppAuthGuard)
  // @Post("/app/sell")
  // async sellStockOnApp(
  //   @Param() position_id: string,
  //   @GetCurrentAppUser() userFromToken: PayLoad
  // ) {
  //   return this._orderService.sellOnApp(position_id, userFromToken.id)
  // }

  // @Post()
  // create(@Body() createOrderDto: CreateOrderDto) {
  //   return this._orderService.create(createOrderDto);
  // }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this._orderService.update(+id, updateOrderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this._orderService.remove(+id);
  }
}
