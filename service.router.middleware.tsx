import type { Context } from "hono";
import { Logger } from "./service.logger";
import type { ServiceAuth } from "./service.auth";
import type { ServiceUser } from "./service.user";
import type { ServiceLink } from "./service.link";

export class ServiceRouterMiddleware {
  private serviceAuth: ServiceAuth;
  private serviceUser: ServiceUser;
  private serviceLink: ServiceLink;

  constructor(
    ServiceUser: ServiceUser,
    ServiceAuth: ServiceAuth,
    ServiceLink: ServiceLink,
  ) {
    this.serviceUser = ServiceUser;
    this.serviceAuth = ServiceAuth;
    this.serviceLink = ServiceLink;
  }

  public getUser = async (ctx: Context) => {
    Logger.log("Function: getUser", __filename);
    const token = await this.serviceAuth.getLoginToken(ctx);
    if ("string" !== typeof token) {
      return null;
    }

    return this.serviceUser.findByPasswordHash(token);
  };

  public itCanPass = async (ctx: Context) => {
    Logger.log("Function: itCanPass", __filename);
    const token = await this.serviceAuth.getLoginToken(ctx);

    if ("string" !== typeof token) {
      return false;
    }

    if (null === this.serviceUser.findByPasswordHash(token)) {
      return false;
    }

    return true;
  };

  public getUserId = async (ctx: Context) => {
    Logger.log("Function: getUserId", __filename);
    const token = await this.serviceAuth.getLoginToken(ctx);
    return "string" === typeof token
      ? this.serviceUser.getUserData(token, "user_id")
      : null;
  };

  public getUserLinks = async (userId: number) => {
    Logger.log("Function: getUserLinks", __filename);
    return "number" === typeof userId ? this.serviceLink.getLinks(userId) : [];
  };
}
