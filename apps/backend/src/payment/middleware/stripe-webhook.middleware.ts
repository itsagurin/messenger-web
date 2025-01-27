import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as bodyParser from 'body-parser';

@Injectable()
export class StripeWebhookMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (req.path.endsWith('/payment/webhook')) {
      return bodyParser.raw({ type: 'application/json' })(req, res, next);
    }
    next();
  }
}