# RoastMyGitHub — Project Brief

## 1. The Idea

RoastMyGitHub is a viral web tool where a developer enters their GitHub username and receives an AI-generated editorial roast of their coding habits, repos, commit messages, and dev persona. The target audience is dev-twitter, indie hackers, and r/programming communities. The goal is results so accurate and funny they get screenshot and tweeted. Solo founder project, built to ship in 2 days.

## 2. Why This Will Work

The viral loop is tight: user gets roasted → result is screenshot-worthy → they tweet it tagging friends → friends get roasted → repeat. The key differentiator is positioning: this is NOT another meme generator. The contrast between elegant literary magazine aesthetics and brutal content creates tension that makes screenshots interesting. A meme is expected to be funny. An editorial takedown that happens to be about your node_modules is genuinely surprising. That surprise is what gets shared. Dev-twitter has an enormous appetite for self-deprecating humor about their own habits (dead side projects, language hopping, "Initial commit" repos). We're giving them a mirror with good lighting and a sharp wit.

## 3. Tech Stack & Why

- **Next.js 15 (App Router)** — SSR for landing speed, dynamic for roast pages, built-in OG image support
- **TypeScript strict** — catches the kind of bugs that kill a 2-day ship
- **Tailwind CSS v4** — utility-first, no component library lock-in, full design control
- **@octokit/rest** — official GitHub API client, typed, reliable
- **@anthropic-ai/sdk** — streaming support out of the box, claude-sonnet-4-5 is the right cost/quality tradeoff
- **lru-cache (fallback)** — zero-config rate limiting and caching for MVP; swap for Upstash Redis when scaling
- **html-to-image** — client-side PNG capture, no server-side headless browser complexity
- **next/font/google** — zero layout shift fonts, no external CDN requests
- **Vercel** — Next.js native deployment, edge functions, no config

## 4. Design Philosophy

The concept is "Editorial Burn Book" — Vanity Fair writing a takedown of your GitHub. The visual joke is the contrast between elegant literary magazine aesthetics and savage content. Typography is serious; words are merciless. That tension IS the product.

**DO:** Parchment cream background (#f5f1e8), charcoal dark mode (#1a1a1a), crimson accent (#c41e3a), asymmetric editorial layout, column rules, drop caps, pull quotes, numbered section markers in mono, paper grain texture.

**DO NOT:** shadcn defaults, purple-pink gradients, dark backgrounds with neon accents, rounded-2xl floating cards, glassmorphism, centered hero with big bold sans-serif and a CTA button.

**Typography:** Instrument Serif (headlines, roast text, pull quotes) / JetBrains Mono (stats, labels, markers) / Geist (UI chrome). Never mid-sentence bold.

## 5. Day-by-Day MVP Plan

### Day 1 (8 hrs)
- Project scaffold: Next.js 15 + TypeScript + Tailwind v4
- Font setup: Instrument Serif, JetBrains Mono, Geist via next/font/google
- Design tokens in globals.css: colors, noise texture, type scale
- ThemeToggle: cream ↔ charcoal
- GitHub fetcher (lib/github.ts): Octokit + all derived signals
- Test fetcher against 3 real GitHub usernames via temp script
- Claude prompt builder (lib/claude.ts): streaming integration
- Iterate prompt until results feel surgical on 3 real users
- Basic landing page with HeroInput

### Day 2 (8 hrs)
- RoastVerdict component: magazine spread layout
- TerminalLoader: scrolling commentary during GitHub fetch
- PullQuote: extracted savage line, 48px italic serif
- StatsCard: mono right-column sidebar
- Roast page (/roast/[username]): server fetch + streaming
- ShareButtons: Tweet + Download PNG
- OG image (opengraph-image.tsx): dynamic per-username card
- Rate limiting (lib/ratelimit.ts)
- Recent Victims strip on landing
- Deploy to Vercel
- Test 3 sample roasts and capture URLs

## 6. Setup Instructions

**Environment variables** (copy .env.local.example to .env.local):
```
ANTHROPIC_API_KEY=sk-ant-...       # console.anthropic.com
GITHUB_TOKEN=ghp_...               # github.com/settings/tokens — no scopes needed for public data
UPSTASH_REDIS_REST_URL=            # optional, upstash.com
UPSTASH_REDIS_REST_TOKEN=          # optional
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**GitHub token:** Go to github.com/settings/tokens → Generate new token (classic) → no scopes selected → copy. This just bumps the API rate limit from 60 to 5000 req/hr.

**Anthropic key:** console.anthropic.com → API Keys → Create key.

**Run:**
```bash
pnpm install
pnpm dev
```

## 7. Launch Plan (First 14 Days)

- **Day 1:** Soft launch on personal X. Roast 5 friends with permission. Post screenshots. Tag them.
- **Day 3:** Post in r/programming and r/webdev — Tuesday 8am EST. Don't link directly; describe what you built and share the funniest result.
- **Day 5:** Indie Hackers product post + milestone update with real numbers.
- **Day 7:** Show HN — Wednesday 8am EST. Title: "Show HN: I made an AI that brutally roasts your GitHub". First comment from yourself: technical writeup of the prompt engineering.
- **Day 10:** Product Hunt launch — Tuesday or Wednesday.
- **Day 14:** Reflection post. What worked. What to build next.

## 8. Success Metrics

- **Day 1:** 100 roasts generated, 10 tweets with the link
- **Week 1:** 5,000 roasts, 1 viral tweet (>50k views), HN front page OR top of subreddit
- **Week 2:** 20,000 roasts cumulative, 50+ organic mentions

## 9. What NOT to Do

- Don't add login — kills viral flow instantly
- Don't add multiple "roast styles" before launch — scope creep
- Don't overthink monetization day 1 — get the loop working first
- Don't reply defensively to X comments from people who don't like it
- Don't A/B test the landing — ship one version, iterate after data

## 10. Future Roadmap (only if v1 hits metrics)

- **Paid tier:** Different critics — roast as Linus Torvalds, as your future tech lead, as your worst code reviewer. $3 each or $9/mo unlimited.
- **PR comment integration:** GitHub Action that posts a roast on every PR → pivots into CodeRoaster as separate B2B product.
- **"Roast my company's repos":** B2B angle for $99 audits of an org's public repos.
- **Affiliate links:** Dev tools mentioned naturally in roasts.

## 11. Kill Criteria

- <500 roasts in week 1 with all launches done = the loop is broken; pivot or kill
- HN + Reddit + PH all flop with no organic sharing = repositioning needed (re-read brief, fix the prompt)
- You stop wanting to open the dashboard = move on, don't sunk-cost-fallacy this
