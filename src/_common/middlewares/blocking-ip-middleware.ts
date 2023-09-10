import { HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

const ipBlockList = new Map<string, Date>();
const requestCount = new Map<string, number>();
const requestTimestamp = new Map<string, number>();
const limit = 60;

@Injectable()
export class BlockingIpMiddleWare implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const clientIp = req.ip;
    const currentTime = Date.now();

    if (ipBlockList.has(clientIp)) {
      const blockEndTime = ipBlockList.get(clientIp);

      if (blockEndTime && blockEndTime > new Date()) {
        res.status(HttpStatus.PERMANENT_REDIRECT).json({ message: '비정상적인 접근으로 IP 접근을 제한합니다.' });
        return;
      } else {
        ipBlockList.delete(clientIp);
      }
    }

    if (!requestTimestamp.has(clientIp)) {
      requestTimestamp.set(clientIp, currentTime);
    }

    if (currentTime - requestTimestamp.get(clientIp) >= 60000) {
      requestTimestamp.set(clientIp, currentTime);
      requestCount.delete(clientIp);
    }

    recordRequest(clientIp, res);

    next();
  }
}

function recordRequest(clientIp: string, res: Response) {
  if (requestCount.has(clientIp)) {
    requestCount.set(clientIp, requestCount.get(clientIp) + 1);
  } else {
    requestCount.set(clientIp, 1);
  }

  const count = requestCount.get(clientIp);

  if (count >= limit) {
    const duration = 10 * 60 * 1000;
    const blockEndTime = new Date(Date.now() + duration);
    ipBlockList.set(clientIp, blockEndTime);
    requestCount.delete(clientIp);
    res
      .status(HttpStatus.PERMANENT_REDIRECT)

      .json({ message: '비정상적인 접근으로 IP 접근을 제한합니다.' });
    return;
  }
}

export function unblockIp(clientIp: string) {
  ipBlockList.delete(clientIp);
}
