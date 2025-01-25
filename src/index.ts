import { Context, Schema } from "koishi";
import zh from "./locales/zh-CN.yml";
import * as common from "./common";
import { initDataBase } from "./database";
import { Config } from "./config";

export const name = "star-qg";
export const reusable = true;

export * from "./config";

export function apply(ctx: Context, config: Config) {
  // 加载语言
  ctx.i18n.define("zh-CN", zh);
  initDataBase(ctx, config);

  ctx
    .intersect((session) => session.subtype === "group")
    .platform("onebot")
    .plugin(common, config);
}
