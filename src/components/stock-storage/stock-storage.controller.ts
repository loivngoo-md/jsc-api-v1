import { Controller, Get, UseGuards } from '@nestjs/common';
import { PayLoad } from '../auth/dto/PayLoad';
import { GetCurrentAppUser } from '../auth/guards/app-user.decorator';
import { AppAuthGuard } from '../auth/guards/appAuth.guard';
import { StockStorageService } from './stock-storage.service';

@Controller('stock-storage')
export class StockStorageController {
    constructor(
        private readonly _stockStorageService: StockStorageService
    ) { }

    @UseGuards(AppAuthGuard)
    @Get("/app")
    async findAllStock(
        @GetCurrentAppUser() user: PayLoad
    ) {
        return this._stockStorageService.list_for_user(user.id)
    }
}
