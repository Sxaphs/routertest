"use client";

import { useState } from "react";
import Link from "next/link";
import { brand } from "@/config/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";

/** OAuth 图标占位（统一首字母字形；TODO(brand): 换正式第三方图标） */
function ProviderGlyph({ name }: { name: string }) {
  return (
    <span className="flex size-5 items-center justify-center rounded-full border text-xs font-bold">
      {name[0]}
    </span>
  );
}

/**
 * 认证卡片（仅 UI）。TODO(backend): 接 OURBRAND 自有认证；
 * OAuth 按钮当前只弹提示。
 */
export function AuthCard({ mode }: { mode: "sign-in" | "sign-up" }) {
  const isUp = mode === "sign-up";
  const [showPw, setShowPw] = useState(false);
  const [notice, setNotice] = useState("");

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-sm">
        <CardContent className="pt-8">
          <h1 className="text-center text-2xl font-bold">
            {isUp ? brand.auth.signUpTitle : brand.auth.signInTitle}
          </h1>

          <div className="mt-6 grid grid-cols-3 gap-2">
            {brand.auth.oauthProviders.map((p) => (
              <Button
                key={p}
                variant="outline"
                aria-label={`Continue with ${p}`}
                onClick={() => setNotice(brand.auth.oauthNotice)}
              >
                <ProviderGlyph name={p} />
              </Button>
            ))}
          </div>
          {notice && (
            <p role="alert" className="mt-2 text-center text-xs text-muted-foreground">
              {notice}
            </p>
          )}

          <div className="my-5 flex items-center gap-3 text-sm text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            or
            <span className="h-px flex-1 bg-border" />
          </div>

          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              setNotice("认证逻辑尚未接入（TODO(backend)）");
            }}
          >
            {isUp && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm" htmlFor="first-name">
                    First name <span className="text-muted-foreground">Optional</span>
                  </label>
                  <Input id="first-name" autoComplete="given-name" />
                </div>
                <div>
                  <label className="text-sm" htmlFor="last-name">
                    Last name <span className="text-muted-foreground">Optional</span>
                  </label>
                  <Input id="last-name" autoComplete="family-name" />
                </div>
              </div>
            )}
            <div>
              <label className="text-sm" htmlFor="email">
                Email address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                autoComplete="email"
              />
            </div>
            {isUp && (
              <div>
                <label className="text-sm" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPw ? "text" : "password"}
                    placeholder="Create a password"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    aria-label="Show password"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-2 top-2 text-xs text-muted-foreground"
                  >
                    {showPw ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
            )}
            {isUp && (
              <label className="flex items-start gap-2 text-sm text-muted-foreground">
                <Checkbox required />
                <span>
                  I agree to the{" "}
                  <Link href="/" className="underline">Terms of Service</Link>,{" "}
                  <Link href="/" className="underline">Privacy Policy</Link>, and{" "}
                  <Link href="/" className="underline">Model Terms</Link>.
                </span>
              </label>
            )}
            <Button type="submit" className="w-full">
              Continue
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            {isUp ? "Already have an account? " : "Don't have an account? "}
            <Link
              href={isUp ? "/sign-in" : "/sign-up"}
              className="text-foreground underline underline-offset-4"
            >
              {isUp ? "Sign in" : "Sign up"}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
