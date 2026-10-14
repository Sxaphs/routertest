import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { brand } from "@/config/brand";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProviderIcon } from "@/components/provider-icon";
import { authorOf, formatDate, getCatalogServer, type CatalogModel } from "@/lib/models";

/** TODO(backend): 换成 OURBRAND 自有目录接口 */
async function getFeaturedModels(): Promise<CatalogModel[]> {
  const all = await getCatalogServer();
  return [...all].sort((a, b) => b.created - a.created).slice(0, 3);
}

export default async function HomePage() {
  const featured = await getFeaturedModels();
  const h = brand.home;

  return (
    <div>
      {/* Hero */}
      <section className="mx-auto max-w-4xl px-4 pt-20 pb-12 text-center">
        <h1 className="text-5xl font-extrabold leading-tight tracking-tight md:text-6xl">
          {h.heroTitle.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h1>
        <p className="mt-6 text-lg text-muted-foreground">
          {h.heroSubtitleLead}
          {h.heroSubtitleLinks.map((l, i) => (
            <span key={l.text}>
              <Link href={l.href} className="underline underline-offset-4">
                {l.text}
              </Link>
              {i === 0 ? ", better " : ""}
            </span>
          ))}
          {h.heroSubtitleTail}
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Button size="lg" asChild>
            <Link href={h.ctaPrimary.href}>{h.ctaPrimary.text}</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href={h.ctaSecondary.href}>
              {h.ctaSecondary.text}
              <ArrowRight className="ml-1 size-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Stats —— mock 数字，TODO(backend): 接真实平台统计 */}
      <section className="mx-auto max-w-4xl px-4 pb-16">
        <div className="grid grid-cols-2 gap-6 text-center md:grid-cols-4">
          {h.stats.map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-extrabold md:text-4xl">{s.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 pb-16 lg:px-6">
        <div className="grid gap-4 md:grid-cols-3">
          {h.features.map((f) => (
            <Link key={f.title} href={f.href} className="group">
              <Card className="h-full transition-colors group-hover:border-primary/40">
                <CardContent className="pt-6">
                  <h3 className="font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
                  <p className="mt-3 text-sm text-primary">{f.linkText}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Models */}
      <section className="mx-auto max-w-6xl px-4 pb-16 lg:px-6">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold">Featured Models</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {h.stats[3].value} active models on {h.stats[2].value} providers
            </p>
          </div>
          <Link
            href="/models"
            className="text-sm text-primary hover:underline"
          >
            View all
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {featured.map((m) => (
            <Link key={m.id} href={`/${m.id}`}>
              <Card className="h-full transition-colors hover:border-primary/40">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <ProviderIcon name={authorOf(m)} />
                    <span className="font-semibold">
                      {m.name.split(": ").slice(1).join(": ") || m.name}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    by {authorOf(m)}
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="secondary">{formatDate(m.created)}</Badge>
                    {/* TODO(backend): 周用量与趋势为 mock */}
                    <span>Tokens —</span>
                    <span>Weekly Trend —</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 pb-16 lg:px-6">
        <h2 className="mb-6 text-2xl font-bold">How it works</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {h.howItWorks.map((s) => (
            <Card key={s.step}>
              <CardContent className="pt-6">
                <span className="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {s.step}
                </span>
                <h3 className="mt-4 font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Recent Blog Posts —— 占位 mock，TODO(backend): 接博客/CMS */}
      <section className="mx-auto max-w-6xl px-4 pb-20 lg:px-6">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-2xl font-bold">Recent Blog Posts</h2>
          <span className="text-sm text-primary">View all</span>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="mb-4 h-28 rounded-md bg-muted" />
                <h3 className="font-semibold">Post title placeholder {i}</h3>
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                  Short excerpt placeholder for a future blog post on our
                  engineering or product updates.
                </p>
                <p className="mt-3 text-xs text-muted-foreground">
                  <time>—</time> <Badge variant="secondary">New</Badge>
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
