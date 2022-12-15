import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FavoriteStockService } from './favorite-stock.service';
import { CreateFavoriteStockDto } from './dto/create-favorite-stock.dto';
import { UpdateFavoriteStockDto } from './dto/update-favorite-stock.dto';

@Controller('favorite-stock')
export class FavoriteStockController {
  constructor(private readonly favoriteStockService: FavoriteStockService) {}

}
