/**
 * 品牌与文案的唯一入口。全站只允许从这里读品牌名、logo、营销文案。
 * 将来替换品牌时只改这个文件。
 */
export const brand = {
  name: "OURBRAND",
  legalName: "OURBRAND, Inc",
  /** 占位 logo：一个圆角方块 + 名称。TODO(brand): 换成正式 logo 资源 */
  logoMark: "◆",
  tagline: "One API. Every Model.",

  nav: [
    { href: "/models", label: "Models" },
    { href: "/chat", label: "Chat" },
    { href: "/rankings", label: "Rankings" },
  ] as const,

  /** 顶部公告条；设为空字符串则不渲染 */
  banner: {
    text: "Launch offer: selected launch-partner models are 50% off for a limited time.",
    linkText: "Browse discounted models",
    linkHref: "/models?discounted=true",
  },

  home: {
    heroTitle: ["One API.", "Every Model."],
    heroSubtitleLead: "Better ",
    heroSubtitleLinks: [
      { text: "pricing", href: "/models?order=pricing-low-to-high" },
      { text: "availability", href: "/rankings" },
    ],
    heroSubtitleTail: ", no subscriptions.",
    ctaPrimary: { text: "Get API Key", href: "/sign-in?redirect_url=%2Fsettings%2Fkeys" },
    ctaSecondary: { text: "Discover Models", href: "/models" },
    /** mock 统计数字，TODO(backend): 接真实平台统计 */
    stats: [
      { value: "120T+", label: "Monthly Tokens" },
      { value: "2M+", label: "Global Users" },
      { value: "30+", label: "Providers" },
      { value: "460+", label: "Models" },
    ],
    features: [
      {
        title: "Higher Availability",
        body: "Reliable AI models via distributed infrastructure. Traffic falls back to healthy providers automatically.",
        linkText: "Learn more",
        href: "/models",
      },
      {
        title: "Price and Performance",
        body: "Keep costs in check without sacrificing speed. Requests are routed for minimal latency.",
        linkText: "Learn more",
        href: "/models",
      },
      {
        title: "Custom Data Policies",
        body: "Fine-grained data policies for your organization. Control which providers may see your prompts.",
        linkText: "View docs",
        href: "/models",
      },
    ],
    howItWorks: [
      {
        step: 1,
        title: "Sign up",
        body: "Create an account to get started. Set up an organization for your team later.",
      },
      {
        step: 2,
        title: "Buy credits",
        body: "Credits can be used with any model or provider.",
      },
      {
        step: 3,
        title: "Get your API key",
        body: "Create an API key and start making requests. Fully OpenAI compatible.",
      },
    ],
  },

  footer: {
    columns: [
      {
        title: "Product",
        links: [
          { text: "Chat", href: "/chat" },
          { text: "Rankings", href: "/rankings" },
          { text: "Models", href: "/models" },
          { text: "Pricing", href: "/models?order=pricing-low-to-high" },
        ],
      },
      {
        title: "Company",
        links: [
          { text: "About", href: "/" },
          { text: "Blog", href: "/" },
          { text: "Privacy", href: "/" },
          { text: "Terms of Service", href: "/" },
        ],
      },
      {
        title: "Developer",
        links: [
          { text: "Documentation", href: "/" },
          { text: "API Reference", href: "/" },
          { text: "Status", href: "/" },
        ],
      },
      {
        title: "Connect",
        links: [
          { text: "X", href: "/" },
          { text: "Discord", href: "/" },
          { text: "GitHub", href: "/" },
        ],
      },
    ],
  },

  auth: {
    signInTitle: "Sign In",
    signUpTitle: "Sign Up",
    oauthProviders: ["GitHub", "Google", "MetaMask"] as const,
    oauthNotice: "OAuth 暂未接入，敬请期待",
  },
} as const;

export type Brand = typeof brand;
