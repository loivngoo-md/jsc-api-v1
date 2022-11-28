import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Query,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { PayLoad } from '../auth/dto/PayLoad';
import { GetCurrentAppUser } from '../auth/guards/app-user.decorator';
import { AppAuthGuard } from '../auth/guards/appAuth.guard';
import { AppUserService } from './app-user.service';
import { CreateAppUserDto } from './dto/create-app-user.dto';
import { UpdateAppUserDto } from './dto/update-app-user.dto';
import { diskStorage } from 'multer';
import LocalFilesInterceptor from 'src/middleware/localFiles.interceptor';


@Controller('app')
export class AppUserController {
  constructor(private readonly appUserService: AppUserService) { }

  @Post()
  create(@Body() createAppUserDto: CreateAppUserDto) {
    return this.appUserService.create(createAppUserDto);
  }

  @Get()
  findAll() {
    return this.appUserService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.appUserService.findOne(+id);
  }

  @UseGuards(AppAuthGuard)
  @Patch()
  update(@GetCurrentAppUser() user: PayLoad, @Body() updateAppUserDto: UpdateAppUserDto) {
    return this.appUserService.update(user.id, updateAppUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.appUserService.remove(+id);
  }

  @Post('upload')
  @UseGuards(AppAuthGuard)
  @UseInterceptors(LocalFilesInterceptor({
    fieldName: 'file',
  }))
  async addCCCD(
    @GetCurrentAppUser() user: PayLoad,
    @UploadedFile() file: Express.Multer.File,
    @Query() query: string
  ) {
    return this.appUserService.addFrontBackCCCD(user.id, {
      path: file.path,
      filename: file.filename,
      mimetype: file.mimetype
    }, {
      type: Number(query['type'])
    });
  }
}
