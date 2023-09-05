import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as multerS3 from 'multer-s3';
import * as multer from 'multer';
import * as AWS from 'aws-sdk';
import { uuid } from 'uuidv4';
import * as path from 'path';
import { Callback } from 'typeorm';

@Injectable()
export class UploadImageMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const s3 = new AWS.S3({
      accessKeyId: process.env.S3_ACCESS_KEY,
      secretAccessKey: process.env.S3_ACCESS_KEY_SECRET,
      region: process.env.AWS_REGION,
    });

    const allowedExtensions = ['.png', '.jpg', '.jpeg', '.jfif', '.exif', '.tiff', '.bmp', '.gif'];

    const upload = multer({
      storage: multerS3({
        s3,
        bucket: process.env.IMAGE_BUCKET_NAME,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key: function (_, file: Express.Multer.File, callback: Callback) {
          const fileId = uuid();
          const type = file.mimetype.split('/')[1];

          if (
            !allowedExtensions.includes(path.extname(file.originalname.toLowerCase())) ||
            !file.mimetype.startsWith('image/')
          ) {
            const errorMessage = ['이미지 파일만 업로드가 가능합니다.'];
            // const errorResponse = { message: errorMessage } ;
            return res.status(400).json(errorMessage);
          }

          const fileName = `${fileId}.${type}`;
          callback(null, fileName);
        },

        acl: 'public-read-write',
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
    });
    upload.single('newFile')(req, res, (err: any) => {
      if (err) {
        if (err.message == 'Unexpected field') return res.status(400).json(['이미지의 최대 업로드 개수는 1개 입니다.']);
        else if (err.message == 'File too large') return res.status(400).json(['이미지의 최대 크기는 5MB 입니다.']);
        else return res.status(500).json(['파일 업로드를 실패 했습니다.']);
      } else {
        next();
      }
    });
  }
}
