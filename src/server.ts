import Koa from 'koa';
import cors from '@koa/cors';
import bodyparser from 'koa-bodyparser';
import { createConnection } from 'typeorm';
import jwt from 'koa-jwt';
import 'reflect-metadata';

import { unprotectedRouter, protectedRouter } from './routes';
import { logger } from './logger';
import { JWT_SECRET } from './constants';

createConnection()
  .then(() => {
    const app = new Koa();

    app.use(logger());
    app.use(cors());
    app.use(bodyparser());

    // 添加错误处理中间件
    app.use(async (ctx, next) => {
      try {
        await next();
      } catch (err) {
        // 只返回 json 格式的响应
        ctx.status = err.status || 500;
        ctx.body = { message: err.message };
      }
    });

    app.use(unprotectedRouter.routes()).use(unprotectedRouter.allowedMethods());
    app.use(jwt({ secret: JWT_SECRET }).unless({ method: 'GET' }));
    app.use(protectedRouter.routes()).use(protectedRouter.allowedMethods());

    app.listen(3000, 'localhost', () => {
      console.log('the server is listening on http://localhost:3000');
    });
  })
  .catch((err: string) => console.log('TypeORM connection error:', err));
