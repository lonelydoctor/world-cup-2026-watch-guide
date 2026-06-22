import { filterMatches, searchCity, searchTeam } from "@/lib/filters";
import type { ConciergeAnswer } from "@/lib/types";

const defaultSuggestions = [
  "今晚有什么比赛",
  "西雅图未来几天有比赛吗",
  "阿根廷未来几天赛程",
  "半决赛和决赛看点"
];

export function answerConcierge(
  query: string,
  timeZone = "America/Los_Angeles",
  now = new Date()
): ConciergeAnswer {
  const q = query.trim();
  const lower = q.toLowerCase();
  const wantsTonight = /今晚|tonight/.test(lower);
  const wantsToday = /今天|今日|today/.test(lower);
  const wantsNextDays = /未来几天|接下来|next|future|这几天/.test(lower);
  const wantsSpotlight = /半决赛|决赛|球员|看点|semifinal|final/.test(lower);
  const city = searchCity(q);
  const team = searchTeam(q);

  if (wantsSpotlight) {
    const matches = filterMatches({
      round: "Semifinals",
      timeZone,
      now
    }).concat(
      filterMatches({
        round: "Final",
        timeZone,
        now
      })
    );
    return {
      intent: "spotlight",
      title: "半决赛 / 决赛观赛看点",
      summary:
        "这里会优先展示半决赛和决赛席位、核心球员、伤停/停赛与故事线。当前未确认席位会用晋级占位显示。",
      matches,
      suggestions: ["决赛在哪里踢", "半决赛什么时候", "哪些比赛值得收藏"]
    };
  }

  if (city) {
    const matches = filterMatches({
      city: city.city,
      dateRange: wantsToday ? "today" : wantsTonight ? "tonight" : "next7",
      timeZone,
      now
    });
    return {
      intent: "city",
      title: `${city.cityZh}观赛安排`,
      summary: matches.length
        ? `${city.cityZh}未来窗口内有 ${matches.length} 场比赛，默认按你的本地时间排序。`
        : `${city.cityZh}在这个时间窗口内没有比赛，可以切换到全赛程查看其他城市。`,
      matches,
      suggestions: ["西雅图未来几天有比赛吗", "纽约决赛时间", "洛杉矶有什么比赛"]
    };
  }

  if (team) {
    const matches = filterMatches({
      team: team.name,
      dateRange: wantsToday ? "today" : wantsTonight ? "tonight" : wantsNextDays ? "next7" : undefined,
      timeZone,
      now
    });
    return {
      intent: "team",
      title: `${team.zhName}赛程`,
      summary: matches.length
        ? `${team.zhName}相关比赛共 ${matches.length} 场。收藏后可以导出到日历。`
        : `${team.zhName}在这个时间窗口内没有可显示比赛。`,
      matches,
      suggestions: [`${team.zhName}未来几天赛程`, "同组比赛", "可能的淘汰赛路径"]
    };
  }

  if (wantsTonight || wantsToday) {
    const matches = filterMatches({
      dateRange: wantsTonight ? "tonight" : "today",
      timeZone,
      now
    });
    return {
      intent: "time",
      title: wantsTonight ? "今晚比赛" : "今日比赛",
      summary: matches.length
        ? `为你找到 ${matches.length} 场比赛，时间按你的本地时区显示。`
        : "当前没有匹配到今天/今晚的比赛。",
      matches,
      suggestions: ["未来三天比赛", "西雅图未来几天", "按国家筛选"]
    };
  }

  if (wantsNextDays) {
    const matches = filterMatches({ dateRange: "next7", timeZone, now });
    return {
      intent: "time",
      title: "未来几天赛程",
      summary: `未来 7 天共有 ${matches.length} 场比赛，可以继续输入城市或国家缩小范围。`,
      matches,
      suggestions: defaultSuggestions
    };
  }

  const matches = filterMatches({ dateRange: "next3", timeZone, now });
  return {
    intent: "general",
    title: "观赛管家",
    summary: "你可以按时间、城市或国家提问。这个助手用规则和赛程数据回答，不调用大模型。",
    matches,
    suggestions: defaultSuggestions
  };
}
