import { Controller, Get, Param, ParseIntPipe, Res, StreamableFile } from '@nestjs/common';
import { createReadStream } from 'fs';
import { join } from 'path';
import { LocalFilesService } from './local-file.service';

@Controller('local-file')
export class LocalFileController {
  constructor(private readonly localFileService: LocalFilesService) {
  }

  @Get(':id')
  async getDatabaseFileById(@Param('id', ParseIntPipe) id: number) {
    const file = await this.localFileService.getFileById(id);

    const stream = createReadStream(join(process.cwd(), file.path));

    return new StreamableFile(stream);
  }
}
