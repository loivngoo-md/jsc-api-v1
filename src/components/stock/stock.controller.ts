import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PayLoad } from '../auth/dto/PayLoad';
import { GetCurrentAppUser } from '../auth/guards/app-user.decorator';
import { AppAuthGuard } from '../auth/guards/appAuth.guard';
import { OrderService } from '../order/order.service';
import { StockStorageService } from '../stock-storage/stock-storage.service';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { StockService } from './stock.service';

@UseGuards(AppAuthGuard)
@Controller('stock')
export class StockController {
  constructor(
    private readonly stockService: StockService,
    private readonly orderService: OrderService,
    private readonly _stockInventoryService: StockStorageService,
  ) {}

  @Get('timeline')
  async get_k_line(
    @Query()
    query: {
      fromtick: string;
      period: string;
      psize: string;
      symbol: string;
    },
  ) {
    return await this.stockService.get_k_line_data(query);
  }

  @Post()
  create(@Body() createStockDto: CreateStockDto) {
    return this.stockService.create(createStockDto);
  }

  @Get('pull')
  pullLatestStock(@Query() query: any) {
    return this.stockService.pullLatestStock(query);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.stockService.findAll(query, 1);
  }

  // @UseGuards(AppAuthGuard)
  // @Get()
  // findAllByApp(@Query() query: any, @GetCurrentAppUser() user: PayLoad) {
  //   return this.stockService.findAllByApp(query, user['id']);
  // }

  @UseGuards(AppAuthGuard)
  @Get(':fs')
  async findOne(@Param('fs') fs: string, @GetCurrentAppUser() user: PayLoad) {
    const stock = await this.stockService.findOne(fs);

    const today_count = await this._stockInventoryService.count_today_purchased(
      user['id'],
      fs,
    );
    const total_count =
      await this._stockInventoryService.count_list_stock_purchased(
        user['id'],
        fs,
      );

    return {
      stock_data: stock,
      user_holding: {
        today_count,
        total_count,
      },
    };
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
