import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import * as uuid from 'uuid';

export enum FileType {
  SOUND = 'sound',
  IMAGE = 'image',
}

@Injectable()
export class FileService {
  async createFile(type: FileType, file: Express.Multer.File): Promise<string> {
    try {
      const fileExtension = file.originalname.split('.').pop();
      const filename = `${uuid.v4()}.${fileExtension}`;
      const filePath = path.resolve(__dirname, '..', 'static', type);

      if (!fs.existsSync(filePath)) {
        fs.mkdirSync(filePath, { recursive: true });
      }

      fs.promises.writeFile(path.resolve(filePath, filename), file.buffer);

      return path.join(type, filename);
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async removeFile(filePath: string) {
    try {
      const fullFilePath = path.resolve(__dirname, '..', 'static', filePath);
      fs.promises.rm(fullFilePath);
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
