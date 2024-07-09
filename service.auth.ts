import { type Context } from 'hono';
import {
  getSignedCookie,
  setSignedCookie,
  deleteCookie,
} from 'hono/cookie'
import { Logger } from './service.logger';


const secret = "root"
const cookieNames = {
  auth: 'token',
}


export class ServiceAuth {
  public login(ctx: Context, userHashId: string) {
    Logger.log('Function: login', __filename)
    return setSignedCookie(ctx, cookieNames.auth, userHashId, secret, {
      httpOnly: true,
      secure: true,
      path: '/',
      sameSite: "Strict",
      maxAge: 604800,
    });
  }


  public logout(ctx: Context) {
    Logger.log('Function: logout', __filename)
    return Boolean(deleteCookie(ctx, "token"));
  }


  public getLoginToken(ctx: Context) {
    Logger.log('Function: getLoginToken', __filename)
    return getSignedCookie(ctx, secret, cookieNames.auth);
  }
}
