import { Card, CardContent } from "@/components/ui/card";
import {
  DAILY_TOKENS_30D,
  OVERVIEW_STATS,
  TOP_USERS,
} from "@/mocks/distribution";

/** 纯 SVG 折线图（近 30 天调用量，无图表库）。TODO(backend): 接真实日用量序列 */
function DailyTokensChart({ values }: { values: number[] }) {
  const W = 720;
  const H = 220;
  const PAD = 8;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const px = (i: number) => PAD + (i / (values.length - 1)) * (W - PAD * 2);
  const py = (v: number) => H - PAD - ((v - min) / span) * (H - PAD * 2);
  const points = values.map((v, i) => `${px(i)},${py(v)}`).join(" ");

  return (
    <div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label="Daily token usage, last 30 days"
      >
        {/* 网格线 */}
        {[0.25, 0.5, 0.75].map((t) => (
          <line
            key={t}
            x1={PAD}
            x2={W - PAD}
            y1={H * t}
            y2={H * t}
            className="stroke-border"
            strokeDasharray="4 4"
          />
        ))}
        <polyline
          points={points}
          fill="none"
          className="stroke-primary"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {values.map((v, i) => (
          <circle key={i} cx={px(i)} cy={py(v)} r={2.5} className="fill-primary" />
        ))}
      </svg>
      <div className="mt-1 flex justify-between text-xs text-muted-foreground">
        <span>30 days ago</span>
        <span>
          Peak {max.toFixed(2)}B · Low {min.toFixed(2)}B tokens/day
        </span>
        <span>Today</span>
      </div>
    </div>
  );
}

/**
 * 分销概览仪表盘（/distribution）：统计卡 + 30 天调用量 + Top 5 终端用户。
 * 全部 mock，TODO(backend): 接分销统计接口。
 */
export default function DistributionOverviewPage() {
  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold">Distribution Overview</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        How your reseller business is performing this month.
      </p>

      {/* 统计卡 */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {OVERVIEW_STATS.map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-6">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {s.label}
              </p>
              <p className="mt-1 text-2xl font-extrabold">{s.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{s.delta}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 近 30 天调用量 */}
      <Card className="mt-6">
        <CardContent className="pt-6">
          <h2 className="font-semibold">Token usage — last 30 days</h2>
          <p className="mb-4 mt-1 text-sm text-muted-foreground">
            Billions of tokens routed through your end users&apos; API keys.
          </p>
          <DailyTokensChart values={DAILY_TOKENS_30D} />
        </CardContent>
      </Card>

      {/* Top 5 终端用户 */}
      <h2 className="mt-10 text-lg font-bold">Top 5 End Users</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Ranked by tokens processed this month.
      </p>
      <div className="mt-4 overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              {["Rank", "End user", "Tokens", "Spend"].map((h) => (
                <th key={h} className="p-3 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TOP_USERS.map((u, i) => (
              <tr key={u.name} className="border-b last:border-0">
                <td className="p-3 text-muted-foreground">{i + 1}</td>
                <td className="p-3 font-medium">{u.name}</td>
                <td className="p-3">{u.tokensB}</td>
                <td className="p-3">{u.spend}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
