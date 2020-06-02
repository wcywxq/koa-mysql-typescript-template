import { Context } from 'koa';
import { getManager } from 'typeorm';

import { User } from '../entity/user';
import { NotFondException, ForbiddenException } from '../exceptions';

export default class UserController {
  public static async listUsers(ctx: Context) {
    const userResponsitory = getManager().getRepository(User);
    const users = await userResponsitory.find();
    ctx.status = 200;
    ctx.body = users;
  }

  public static async showUserDetail(ctx: Context) {
    const userResponsitory = getManager().getRepository(User);
    const user = await userResponsitory.findOne(+ctx.params.id);

    if (user) {
      ctx.status = 200;
      ctx.body = user;
    } else {
      // ctx.status = 404;
      throw new NotFondException();
    }
  }

  public static async updateUser(ctx: Context) {
    // 更新用户时，确保是用户本人在操作
    const userId = +ctx.params.id;
    if (userId !== +ctx.state.user.id) {
      // ctx.status = 403;
      // ctx.body = { message: '无权进行此操作' };
      // return;
      throw new ForbiddenException();
    }

    const userResponsitory = getManager().getRepository(User);
    await userResponsitory.update(userId, ctx.request.body);
    const updateUser = await userResponsitory.findOne(+ctx.params.id);

    if (updateUser) {
      ctx.status = 200;
      ctx.body = updateUser;
    } else {
      // ctx.status = 404;
      throw new NotFondException();
    }
  }

  public static async deleteUser(ctx: Context) {
    console.log(ctx.state);
    // 删除用户时，确保是用户本人在操作
    const userId = +ctx.params.id;

    if (userId !== +ctx.state.user.id) {
      // ctx.status = 403;
      // ctx.body = { message: '无权进行此操作' };
      // return;
      throw new ForbiddenException();
    }

    const userResponsitory = getManager().getRepository(User);
    await userResponsitory.delete(+ctx.params.id);

    ctx.status = 204;
  }
}
