import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as multerS3 from 'multer-s3';
import * as multer from 'multer';
import * as AWS from 'aws-sdk';
import { uuid } from 'uuidv4';
import { Callback } from 'typeorm';

@Injectable()
export class UploadMultiMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const s3 = new AWS.S3({
      accessKeyId: process.env.S3_ACCESS_KEY,
      secretAccessKey: process.env.S3_ACCESS_KEY_SECRET,
      region: process.env.AWS_REGION,
    });

    const upload = multer({
      storage: multerS3({
        s3,
        bucket: process.env.MULTI_BUCKET_NAME,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key: function (_, file: Express.Multer.File, callback: Callback) {
          const fileId = uuid();
          const array = file.originalname.split('.');
          const type = file.originalname.split('.')[array.length - 1];

          const fileName = `${fileId}.${type}`;
          callback(null, fileName);
        },
        acl: 'public-read-write',
      }),
      limits: { fileSize: 10 * 1024 * 1024 },
    });

    upload.array('newFiles', 5)(req, res, (err: any) => {
      if (err) {
        if (err.message == 'Unexpected field')
          return res.status(400).json({ message: '파일의 최대 업로드 개수는 5개 입니다.' });
        else if (err.message == 'File too large')
          return res.status(400).json({ message: '파일의 최대 크기는 5MB 입니다.' });
        else return res.status(500).json({ message: '파일 업로드를 실패 했습니다.' });
      } else {
        next();
      }
    });
  }
}
