import { PartialType } from '@nestjs/swagger';
import { CreateFavoriteStockDto } from './create-favorite-stock.dto';

export class UpdateFavoriteStockDto extends PartialType(CreateFavoriteStockDto) {}
