import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as bodyParser from 'body-parser';

@Injectable()
export class StripeWebhookMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    bodyParser.raw({
      type: 'application/json',
      verify: (req: any, res, buffer) => {
        if (req.url === '/payment/webhook') {
          req.rawBody = buffer;
        }
        return true;
      }
    })(req, res, next);
  }
}