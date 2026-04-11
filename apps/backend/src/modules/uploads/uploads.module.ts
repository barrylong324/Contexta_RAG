import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { UploadsService } from './uploads.service';
import { UploadsController } from './uploads.controller';
import { DocumentsModule } from '../documents/documents.module';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';

@Module({
    imports: [
        MulterModule.register({
            storage: diskStorage({
                destination: './uploads/temp',
                filename: (req, file, cb) => {
                    const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
                    cb(null, uniqueName);
                },
            }),
            limits: {
                fileSize: 50 * 1024 * 1024, // 50MB
            },
        }),
        DocumentsModule,
    ],
    providers: [UploadsService],
    controllers: [UploadsController],
    exports: [UploadsService],
})
export class UploadsModule {}
