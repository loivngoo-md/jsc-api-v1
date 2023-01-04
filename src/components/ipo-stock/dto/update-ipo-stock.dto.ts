import { PartialType } from '@nestjs/swagger';
import { IpoStockCreate } from './create-ipo-stock.dto';

export class IpoStockUpdate extends PartialType(IpoStockCreate) {}
