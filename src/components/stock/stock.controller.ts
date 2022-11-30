import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { StockService } from './stock.service';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { OrderService } from '../order/order.service';

@Controller('stock')
export class StockController {
  constructor(
    private readonly stockService: StockService,
    private readonly orderService: OrderService
  ) { }

  @Post()
  create(@Body() createStockDto: CreateStockDto) {
    return this.stockService.create(createStockDto);
  }

  @Get('pull')
  pullLatestStock(@Query() query) {
    return this.stockService.pullLatestStock(query);
  }

  @Get()
  findAll(@Query() query) {
    return this.stockService.findAll(query);
  }

  @Get('/:fs')
  async findOne(@Param('fs') fs: string) {
    const stock = await this.stockService.findOne(fs);
    return {
      stock_data: stock,
      user_holding: {
        today_count: 37,
        total_count: 155
      }
    }

  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStockDto: UpdateStockDto) {
    return this.stockService.update(id, updateStockDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.stockService.remove(+id);
  }
}
