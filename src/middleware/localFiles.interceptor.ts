import { FileInterceptor } from '@nestjs/platform-express';
import { Injectable, mixin, NestInterceptor, Type } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import { v4 as uuid } from 'uuid';

interface LocalFilesInterceptorOptions {
  fieldName: string;
  path?: string;
}

function LocalFilesInterceptor(options: LocalFilesInterceptorOptions): Type<NestInterceptor> {
  @Injectable()
  class Interceptor implements NestInterceptor {
    fileInterceptor: NestInterceptor;
    constructor(configService: ConfigService) {
      const filesDestination = './public/uploads'

      const destination = `${filesDestination}`

      const multerOptions: MulterOptions = {
        storage: diskStorage({
          destination,
          filename: (request, file, callback) => {
            callback(
              null,
              `${uuid()}.${file.originalname
                .split('.')
                .pop()
                .toLowerCase()}`,
            );
          },
        })
      }

      this.fileInterceptor = new (FileInterceptor(options.fieldName, multerOptions));
    }

    intercept(...args: Parameters<NestInterceptor['intercept']>) {
      return this.fileInterceptor.intercept(...args);
    }
  }
  return mixin(Interceptor);
}

export default LocalFilesInterceptor;