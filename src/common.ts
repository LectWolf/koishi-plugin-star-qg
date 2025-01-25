import { Context, h, Session, Time } from "koishi";
import { Config } from ".";
import {} from "@koishijs/cache";

export function apply(ctx: Context, config: Config) {
  ctx
    .command("add_admin <QQ>")
    .alias("添加管理员")
    .action(async ({ session }, t_qq) => {
      if (!(await checkPermission(session, config))) {
        // 无权限
        return;
      }
      if (!t_qq) {
        return reply(session, ".format");
      }
      const qq = t_qq.replace(/\D/g, "");
      if (!qq || qq.length < 5 || qq.length > 11) {
        return reply(session, "invalidqq");
      }

      const [admin] = await ctx.database.get("star_qg_admin", {
        group: session.guildId,
        qq,
      });
      if (admin) {
        return reply(session, ".hasexist", { qq });
      }
      await ctx.database.upsert("star_qg_admin", [
        { group: session.guildId, qq },
      ]);
      return reply(session, ".success", { qq });
    });
  // 删除管理员
  ctx
    .command("remove_admin <QQ>")
    .alias("删除管理员")
    .action(async ({ session }, t_qq) => {
      if (!(await checkPermission(session, config))) {
        return; // 无权限
      }
      if (!t_qq) {
        return reply(session, ".format");
      }
      const qq = t_qq.replace(/\D/g, "");
      if (!qq || qq.length < 5 || qq.length > 11) {
        return reply(session, "invalidqq");
      }
      const [admin] = await ctx.database.get("star_qg_admin", {
        group: session.guildId,
        qq,
      });
      if (!admin) {
        return reply(session, ".notexist", { qq });
      }
      await ctx.database.remove("star_qg_admin", {
        group: session.guildId,
        qq,
      });
      return reply(session, ".success", { qq });
    });

  ctx
    .command("add_title <QQ> <title>")
    .alias("添加头衔")
    .action(async ({ session }, t_qq, title) => {
      if (!(await checkPermission(session, config))) {
        const [admin] = await ctx.database.get("star_qg_admin", {
          group: session.guildId,
          qq: session.userId,
        });
        if (!admin) {
          return; // 无权限
        }
      }
      if (!t_qq) {
        return reply(session, ".format");
      }
      const qq = t_qq.replace(/\D/g, "");
      if (!qq || qq.length < 5 || qq.length > 11) {
        return reply(session, "invalidqq");
      }

      if (!title) {
        return reply(session, "invalidtitle");
      }

      await session.bot.internal.set_group_special_title(
        session.guildId,
        qq,
        title,
        -1
      );
      return reply(session, ".success", { qq, title });
    });

  ctx
    .command("mute <QQ> <time>")
    .alias("禁言")
    .action(async ({ session }, t_qq, time) => {
      if (!(await checkPermission(session, config))) {
        const [admin] = await ctx.database.get("star_qg_admin", {
          group: session.guildId,
          qq: session.userId,
        });
        if (!admin) {
          return; // 无权限
        }
      }
      if (!t_qq) {
        return reply(session, ".format");
      }
      const qq = t_qq.replace(/\D/g, "");
      if (!qq || qq.length < 5 || qq.length > 11) {
        return reply(session, "invalidqq");
      }
      const muteTime = parseTimeToSeconds(time);

      await session.bot.internal.set_group_ban(session.guildId, qq, muteTime);
      return reply(session, ".success", { qq, time: muteTime });
    });
}

// 判断权限
export async function checkPermission(session: Session, config: Config) {
  if (!config.admin.includes(session.userId)) {
    return false;
  }
  return true;
}

// 时间解析

export function parseTimeToSeconds(time: string): number {
  const timeRegex = /(\d+d)?(\d+h)?(\d+m)?/i;
  const matches = time.match(timeRegex);

  if (!matches) {
    return 0;
  }

  const days = parseInt(matches[1]) || 0;
  const hours = parseInt(matches[2]) || 0;
  const minutes = parseInt(matches[3]) || 0;

  return days * 86400 + hours * 3600 + minutes * 60;
}

// 回复
export function reply(
  session: Session,
  path: string | string[],
  params?: object
) {
  const content = session.text(path, params);
  if (session.platform === "qq") {
    return "\r" + content;
  }
  if (session.subtype === "private") {
    return content;
  }
  return [h.at(session.userId), "\r" + content];
}
