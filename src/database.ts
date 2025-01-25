import { Context } from "koishi";
import { Config } from "src";

declare module "koishi" {
  interface Tables {
    star_qg_admin: StarQgAdmin;
  }
}

export function initDataBase(ctx: Context, config: Config) {
  ctx.model.extend(
    "star_qg_admin",
    {
      id: "unsigned",
      group: "string",
      qq: "string",
    },
    {
      autoInc: true,
    }
  );
}

// 群管理员
export interface StarQgAdmin {
  id: number;
  group: string;
  qq: string;
}
