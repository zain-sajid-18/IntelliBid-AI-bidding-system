"use client";

import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import {
  ArrowUpRight, Bot, Boxes, Gavel, Sparkles, Timer, TrendingUp, Zap,
  ShieldCheck, Wallet, BellRing, Search, Star, Check, Plus, Minus,
  Camera, Music, Watch, Palette, Shirt, Gem, Quote, PlayCircle,
} from "lucide-react";
import { MagneticButton } from "./MagneticButton";
import { LiquidCursor } from "./LiquidCursor";

/* ---------------- assets ---------------- */
const lotSneaker = "/lot-sneaker.jpg";
const lotArt = "/lot-art.jpg";
const lotWalkman = "/lot-walkman.jpg";
const lotCamera = "/lot-camera.jpg";
const lotWatch = "/lot-watch.jpg";
const lotGuitar = "/lot-guitar.jpg";
const avatar1 = "/avatar-1.jpg";
const avatar2 = "/avatar-2.jpg";
const avatar3 = "/avatar-3.jpg";

/* ---------------- helpers ---------------- */

function Reveal({ children, delay = 0, y = 60 }) {
  return (
    <motion.div
      initial={{ y, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ---------------- top announcement ---------------- */

function TopBar() {
  return (
    <div className="border-b-[3px] border-[var(--ink)] bg-[var(--ink)] text-white w-full">
      <div className="mx-auto flex w-full items-center justify-between gap-4 px-6 py-2 text-xs font-bold uppercase tracking-wider md:px-10">
        <span className="flex items-center gap-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--hotpink)]" />
          Live: 4,219 auctions
        </span>
        <span className="hidden md:inline">⚡ New: AI Auction Agent — try “find me a vintage Rolex”</span>
        <div className="flex items-center gap-6">
          <a href="/login" className="hover:text-[var(--acid)] transition-colors">Login</a>
          <a href="/register" className="rounded-full border-2 border-[var(--acid)] bg-[var(--acid)] px-4 py-1 text-[var(--ink)] hover:bg-transparent hover:text-[var(--acid)] transition-colors">Sign up</a>
        </div>
      </div>
    </div>
  );
}

/* ---------------- hero ---------------- */

function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const rot = useTransform(scrollYProgress, [0, 1], [0, 25]);

  return (
    <section ref={ref} className="relative grain overflow-hidden px-6 pb-24 pt-8 md:px-16 md:pt-10">
      {/* Floating shapes — kept to the SIDES so headline is never covered */}
      <motion.div
        style={{ y: y1, rotate: rot }}
        className="pointer-events-none absolute -left-20 top-20 h-44 w-44 animate-blob border-[3px] border-[var(--ink)] bg-[var(--hotpink)] shadow-[var(--shadow-brutal-lg)] md:-left-24 md:h-56 md:w-56"
      />
      <motion.div
        style={{ y: y2 }}
        className="pointer-events-none absolute -right-10 top-24 h-40 w-40 rotate-12 rounded-3xl border-[3px] border-[var(--ink)] bg-[var(--electric)] shadow-[var(--shadow-brutal)] md:h-56 md:w-56"
      />
      <motion.div
        style={{ y: y1 }}
        className="pointer-events-none absolute right-1/4 top-[55%] hidden h-20 w-20 rounded-full border-[3px] border-[var(--ink)] bg-[var(--sunset)] shadow-[var(--shadow-brutal)] md:block"
      />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 lg:grid-cols-12">
        {/* Left: copy */}
        <div className="lg:col-span-7">
          <Reveal>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border-[3px] border-[var(--ink)] bg-white px-4 py-2 font-display text-xs font-black uppercase shadow-[var(--shadow-brutal)]">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--hotpink)]" /> 12,847 bidders online · No.1 on Product Hunt
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <h1 className="font-display text-[3rem] font-black leading-[0.88] tracking-tighter md:text-[6.5rem]">
              <span className="inline-block -rotate-2 rounded-3xl border-[4px] border-[var(--ink)] bg-[var(--acid)] px-4 py-1 shadow-[var(--shadow-brutal-lg)]">
                Bid
              </span>{" "}
              smarter.<br />
              <span className="inline-block rotate-2 rounded-3xl border-[4px] border-[var(--ink)] bg-[var(--acid)] px-4 py-1 shadow-[var(--shadow-brutal-lg)] mt-2">
                Win
              </span>{" "}
              <span className="text-stroke">louder.</span>
            </h1>
          </Reveal>

          <Reveal delay={0.15}>
            <p className="mt-8 max-w-xl text-lg text-[var(--ink)]/75 md:text-xl">
              IntelliBid is the AI-powered auction playground where machine intelligence meets human hustle. 3D previews, real-time bids, instant payouts — zero gatekeeping.
            </p>
          </Reveal>

          {/* AI search bar */}
          <Reveal delay={0.2}>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="mt-8 flex max-w-xl items-center gap-2 rounded-full border-[3px] border-[var(--ink)] bg-white p-2 shadow-[var(--shadow-brutal)]"
            >
              <Search className="ml-3 h-5 w-5 shrink-0" strokeWidth={2.5} />
              <input
                type="text"
                placeholder="Try: ‘vintage cameras under $500’"
                className="w-full bg-transparent px-2 py-2 text-base font-medium placeholder:text-[var(--ink)]/40 focus:outline-none"
              />
              <button className="rounded-full border-[3px] border-[var(--ink)] bg-[var(--electric)] px-5 py-2 font-display text-sm font-black uppercase">
                Ask AI
              </button>
            </form>
          </Reveal>

          <Reveal delay={0.3}>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <MagneticButton bg="var(--hotpink)" onClick={() => window.location.href = '/login'}>
                Start Bidding <ArrowUpRight className="h-5 w-5" strokeWidth={3} />
              </MagneticButton>
              <MagneticButton bg="white">
                <PlayCircle className="h-5 w-5" strokeWidth={3} /> Watch demo
              </MagneticButton>
            </div>
          </Reveal>

          <Reveal delay={0.4}>
            <div className="mt-12 flex items-center gap-5">
              <div className="flex -space-x-3">
                {[avatar1, avatar2, avatar3].map((a, i) => (
                  <img
                    key={i}
                    src={a}
                    alt=""
                    width={48}
                    height={48}
                    loading="lazy"
                    className="h-12 w-12 rounded-full border-[3px] border-[var(--ink)] object-cover"
                  />
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-[var(--ink)] text-[var(--ink)]" />
                  ))}
                  <span className="ml-2 font-display text-sm font-black">4.9/5</span>
                </div>
                <div className="text-xs text-[var(--ink)]/70">Loved by 120,000+ collectors</div>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Right: featured live lot card */}
        <div className="relative lg:col-span-5 -mt-10 md:-mt-20">
          <Reveal delay={0.2} y={0}>
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="brutal-lg relative mx-auto max-w-md overflow-hidden bg-white"
            >
              <div className="relative h-72 overflow-hidden border-b-[3px] border-[var(--ink)]">
                <img src={lotSneaker} alt="Air Jordan 1 Chicago 1985" width={1024} height={1024} className="h-full w-full object-cover" />
                <div className="absolute left-4 top-4 flex items-center gap-1 rounded-full border-[3px] border-[var(--ink)] bg-[var(--ink)] px-3 py-1 font-display text-xs font-black uppercase text-white">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--hotpink)]" /> LIVE
                </div>
                <div className="absolute right-4 top-4 rounded-full border-[3px] border-[var(--ink)] bg-[var(--acid)] px-3 py-1 font-display text-xs font-black uppercase tabular-nums">
                  ⏱ 02:14:09
                </div>
              </div>
              <div className="p-6">
                <div className="text-xs font-bold uppercase text-[var(--ink)]/60">Sneakers · Lot #4471</div>
                <h3 className="mt-1 font-display text-2xl font-black leading-tight">Air Jordan 1 ‘Chicago’ 1985</h3>
                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <div className="text-xs uppercase text-[var(--ink)]/60">Top bid</div>
                    <div className="font-display text-4xl font-black">$12,400</div>
                    <div className="text-xs text-[var(--ink)]/60">+$200 from @sneakerhead</div>
                  </div>
                  <button className="rounded-full border-[3px] border-[var(--ink)] bg-[var(--electric)] px-5 py-3 font-display text-sm font-black uppercase shadow-[4px_4px_0_0_var(--ink)] transition-transform hover:-translate-y-0.5">
                    Bid $12.6k
                  </button>
                </div>
              </div>
            </motion.div>

            {/* floating notification card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="absolute -bottom-6 -left-4 hidden items-center gap-3 rounded-2xl border-[3px] border-[var(--ink)] bg-white px-4 py-3 shadow-[var(--shadow-brutal)] md:flex"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border-[3px] border-[var(--ink)] bg-[var(--hotpink)]">
                <BellRing className="h-5 w-5" strokeWidth={2.5} />
              </span>
              <div>
                <div className="font-display text-sm font-black">You’re winning!</div>
                <div className="text-xs text-[var(--ink)]/60">+$200 outbid alert</div>
              </div>
            </motion.div>
          </Reveal>
        </div>
      </div>

      {/* stats strip */}
      <Reveal delay={0.45}>
        <div className="relative mx-auto mt-20 grid max-w-6xl grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { k: "$48M+", v: "Total bid volume" },
            { k: "120K", v: "Active members" },
            { k: "<200ms", v: "Live bid latency" },
            { k: "98.4%", v: "Buyer satisfaction" },
          ].map((s) => (
            <div key={s.v} className="brutal p-5">
              <div className="font-display text-3xl font-black md:text-4xl">{s.k}</div>
              <div className="text-xs text-[var(--ink)]/70 md:text-sm">{s.v}</div>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

/* ---------------- marquee ---------------- */

function Marquee() {
  const items = ["LIVE BIDDING", "AI PRICING", "3D PREVIEWS", "INSTANT PAYOUTS", "ZERO HASSLE", "NEXT-GEN AUCTIONS"];
  return (
    <div className="relative overflow-hidden border-y-[3px] border-[var(--ink)] bg-[var(--acid)] py-4">
      <div className="flex w-max animate-marquee gap-12 whitespace-nowrap font-display text-2xl font-black uppercase">
        {[...items, ...items, ...items].map((t, i) => (
          <span key={i} className="flex items-center gap-12">
            {t} <Sparkles className="h-6 w-6" />
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------------- categories ---------------- */

function Categories() {
  const cats = [
    { icon: Shirt, label: "Sneakers", count: 1240, c: "var(--electric)" },
    { icon: Palette, label: "Art", count: 824, c: "var(--hotpink)" },
    { icon: Watch, label: "Watches", count: 512, c: "var(--sunset)" },
    { icon: Camera, label: "Cameras", count: 318, c: "var(--acid)" },
    { icon: Music, label: "Music", count: 226, c: "var(--electric)" },
    { icon: Gem, label: "Jewelry", count: 192, c: "var(--hotpink)" },
  ];
  return (
    <section className="px-6 py-20 md:px-16">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <div className="mb-10 flex items-end justify-between">
            <h2 className="font-display text-4xl font-black tracking-tighter md:text-5xl">Browse by vibe.</h2>
            <a href="/discover" className="hidden font-display text-sm font-black uppercase underline decoration-[3px] underline-offset-8 md:inline">All categories →</a>
          </div>
        </Reveal>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-6">
          {cats.map((c, i) => (
            <Reveal key={c.label} delay={i * 0.05}>
              <motion.button whileHover={{ y: -6, rotate: -2 }} className="brutal flex w-full flex-col items-start gap-3 p-5 text-left transition-shadow" style={{ background: c.c }}>
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl border-[3px] border-[var(--ink)] bg-white">
                  <c.icon className="h-6 w-6" strokeWidth={2.5} />
                </span>
                <div>
                  <div className="font-display text-lg font-black">{c.label}</div>
                  <div className="text-xs text-[var(--ink)]/70">{c.count.toLocaleString()} lots</div>
                </div>
              </motion.button>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- bento ---------------- */

function Bento() {
  const tiles = [
    { span: "md:col-span-2 md:row-span-2", bg: "var(--electric)", icon: Bot, title: "AI Auction Agent", body: "Just say it — “show me vintage cameras under $500” — and watch the page rearrange itself in real time.", big: true },
    { span: "md:col-span-2", bg: "var(--acid)", icon: Gavel, title: "Live Bidding", body: "Sub-200ms WebSocket bids. No refresh, no regrets." },
    { span: "", bg: "var(--hotpink)", icon: Boxes, title: "3D Previews", body: "Spin it. Inspect it. Trust it." },
    { span: "", bg: "white", icon: Sparkles, title: "Smart Pricing", body: "AI suggests fair value the moment you list." },
    { span: "md:col-span-2", bg: "var(--sunset)", icon: ShieldCheck, title: "Verified Sellers", body: "Bidder protection + trust scores baked in." },
    { span: "", bg: "white", icon: Wallet, title: "Stripe Payouts", body: "Win, pay, ship. Done." },
    { span: "", bg: "var(--electric)", icon: BellRing, title: "Smart Alerts", body: "Outbid? You'll know in a heartbeat." },
  ];
  return (
    <section className="px-6 py-24 md:px-16">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
            <h2 className="max-w-2xl font-display text-5xl font-black leading-[0.95] tracking-tighter md:text-7xl">
              Built like a <span className="inline-block rotate-2 rounded-2xl border-[3px] border-[var(--ink)] bg-[var(--hotpink)] px-3">toolkit.</span> Feels like a game.
            </h2>
            <p className="max-w-sm text-[var(--ink)]/70">A bento of features that make bidding feel less like 1999 and more like 2030.</p>
          </div>
        </Reveal>
        <div className="grid auto-rows-[180px] grid-cols-1 gap-5 md:grid-cols-4">
          {tiles.map((t, i) => (
            <Reveal key={i} delay={i * 0.04}>
              <div className={`brutal-lg group relative h-full overflow-hidden p-6 transition-transform hover:-translate-y-1 ${t.span}`} style={{ background: t.bg }}>
                <div className="flex h-full flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl border-[3px] border-[var(--ink)] bg-white">
                      <t.icon className="h-6 w-6" strokeWidth={2.5} />
                    </span>
                    <ArrowUpRight className="h-6 w-6 transition-transform group-hover:rotate-45" strokeWidth={3} />
                  </div>
                  <div>
                    <h3 className={`font-display font-black tracking-tight ${t.big ? "text-3xl md:text-5xl" : "text-xl md:text-2xl"}`}>{t.title}</h3>
                    <p className="mt-2 max-w-md text-sm text-[var(--ink)]/80 md:text-base">{t.body}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- agent demo ---------------- */

function AgentDemo() {
  const lines = [
    { who: "you", text: "Find me retro tech under $1,000 ending today" },
    { who: "ai", text: "Got it. 14 lots match. Sorting by ‘ending soonest’." },
    { who: "you", text: "Auto-bid up to $750 on the Walkman" },
    { who: "ai", text: "Auto-bid armed. I’ll bid in $25 increments. ✅" },
  ];
  return (
    <section className="border-y-[3px] border-[var(--ink)] bg-[var(--acid)] px-6 py-24 md:px-16">
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
        <Reveal>
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border-[3px] border-[var(--ink)] bg-white px-3 py-1 font-display text-xs font-black uppercase">
              <Bot className="h-4 w-4" /> Agent Mode
            </div>
            <h2 className="mt-6 font-display text-5xl font-black tracking-tighter md:text-7xl">
              Talk to it<br />like a friend.
            </h2>
            <p className="mt-6 max-w-md text-lg text-[var(--ink)]/80">
              Natural language. Real outcomes. Tell IntelliBid what you want and it browses, filters, and even bids on your behalf.
            </p>
            <ul className="mt-8 space-y-3">
              {["Multi-step requests, no menus", "Auto-bid with smart caps", "Explains every move it makes"].map((f) => (
                <li key={f} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full border-[3px] border-[var(--ink)] bg-[var(--electric)]">
                    <Check className="h-4 w-4" strokeWidth={3} />
                  </span>
                  <span className="font-medium">{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="brutal-lg overflow-hidden bg-white">
            <div className="flex items-center justify-between border-b-[3px] border-[var(--ink)] bg-[var(--ink)] px-5 py-3 text-white">
              <div className="flex items-center gap-2 font-display font-black">
                <span className="h-3 w-3 rounded-full bg-[var(--hotpink)]" />
                <span className="h-3 w-3 rounded-full bg-[var(--acid)]" />
                <span className="h-3 w-3 rounded-full bg-[var(--electric)]" />
                <span className="ml-3 text-xs uppercase">intellibid · agent</span>
              </div>
              <span className="text-xs uppercase opacity-70">v3.1</span>
            </div>
            <div className="space-y-4 p-6">
              {lines.map((l, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2 }}
                  className={`flex ${l.who === "you" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-3xl border-[3px] border-[var(--ink)] px-5 py-3 font-medium shadow-[4px_4px_0_0_var(--ink)] ${l.who === "you" ? "bg-[var(--electric)]" : "bg-[var(--acid)]"}`}
                  >
                    {l.text}
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="flex items-center gap-2 border-t-[3px] border-[var(--ink)] bg-[var(--background)] p-4">
              <input className="w-full rounded-full border-[3px] border-[var(--ink)] bg-white px-4 py-2 text-sm focus:outline-none" placeholder="Message the agent…" />
              <button className="rounded-full border-[3px] border-[var(--ink)] bg-[var(--hotpink)] p-2"><ArrowUpRight className="h-5 w-5" strokeWidth={3} /></button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- how it works ---------------- */

function HowItWorks() {
  const steps = [
    { n: "01", t: "Snap & list", d: "Upload photos. AI writes the description and sets a smart starting price.", c: "var(--acid)", icon: Boxes },
    { n: "02", t: "Go live", d: "Bidders join from anywhere. Real-time updates with zero lag.", c: "var(--electric)", icon: Zap },
    { n: "03", t: "Cash in", d: "Winner pays via Stripe. You get notified the second it clears.", c: "var(--hotpink)", icon: TrendingUp },
  ];
  return (
    <section className="bg-white px-6 py-24 md:px-16">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <div className="mb-16 flex items-end justify-between">
            <h2 className="font-display text-5xl font-black tracking-tighter md:text-7xl">How it works.</h2>
            <Timer className="hidden h-12 w-12 md:block" strokeWidth={2.5} />
          </div>
        </Reveal>
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.1}>
              <motion.div whileHover={{ rotate: -1, y: -4 }} className="brutal-lg relative p-8" style={{ background: s.c }}>
                <div className="font-display text-7xl font-black opacity-40">{s.n}</div>
                <s.icon className="mt-4 h-10 w-10" strokeWidth={2.5} />
                <h3 className="mt-4 font-display text-3xl font-black">{s.t}</h3>
                <p className="mt-2 text-[var(--ink)]/80">{s.d}</p>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- live auctions ---------------- */

function LiveAuctions() {
  const lots = [
    { img: lotSneaker, tag: "Sneakers", title: "Air Jordan 1 ‘Chicago’ 1985", bid: "$12,400", time: "02:14:09", bidders: 47 },
    { img: lotArt, tag: "Art", title: "Untitled — Neo Pop Print 04/12", bid: "$2,860", time: "00:47:33", bidders: 22 },
    { img: lotWalkman, tag: "Tech", title: "Mint Sony Walkman TPS-L2", bid: "$980", time: "05:11:02", bidders: 18 },
    { img: lotCamera, tag: "Cameras", title: "Polaroid SX-70 Land Camera", bid: "$420", time: "01:02:44", bidders: 31 },
    { img: lotWatch, tag: "Watches", title: "Rolex Submariner 16610", bid: "$8,750", time: "03:38:11", bidders: 64 },
    { img: lotGuitar, tag: "Music", title: "Fender Stratocaster ‘78", bid: "$3,210", time: "00:22:08", bidders: 27 },
  ];
  const [tab, setTab] = useState("hot");

  return (
    <section className="px-6 py-24 md:px-16">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-display text-5xl font-black tracking-tighter md:text-7xl">Live <span className="text-stroke">right now</span>.</h2>
            <div className="flex items-center gap-2 rounded-full border-[3px] border-[var(--ink)] bg-white p-1 shadow-[var(--shadow-brutal)]">
              {(["hot", "ending", "new"]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`rounded-full px-4 py-2 font-display text-xs font-black uppercase transition-colors ${tab === t ? "bg-[var(--ink)] text-white" : "text-[var(--ink)]/70 hover:bg-[var(--background)]"}`}
                >
                  {t === "hot" ? "🔥 Hot" : t === "ending" ? "⏱ Ending" : "✨ New"}
                </button>
              ))}
            </div>
          </div>
        </Reveal>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {lots.map((lot, i) => (
            <Reveal key={i} delay={i * 0.06}>
              <motion.div whileHover={{ y: -8 }} className="brutal-lg overflow-hidden bg-white">
                <div className="relative h-60 overflow-hidden border-b-[3px] border-[var(--ink)]">
                  <img src={lot.img} alt={lot.title} loading="lazy" width={1024} height={1024} className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
                  <div className="absolute left-4 top-4 rounded-full border-[3px] border-[var(--ink)] bg-white px-3 py-1 font-display text-xs font-black uppercase">{lot.tag}</div>
                  <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full border-[3px] border-[var(--ink)] bg-[var(--ink)] px-3 py-1 font-display text-xs font-black uppercase text-white">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--hotpink)]" /> LIVE
                  </div>
                  <div className="absolute bottom-4 right-4 rounded-full border-[3px] border-[var(--ink)] bg-[var(--acid)] px-3 py-1 font-display text-xs font-black uppercase tabular-nums">
                    ⏱ {lot.time}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-display text-lg font-black leading-tight">{lot.title}</h3>
                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <div className="text-xs uppercase text-[var(--ink)]/60">Top bid · {lot.bidders} bidders</div>
                      <div className="font-display text-2xl font-black">{lot.bid}</div>
                    </div>
                    <button className="rounded-full border-[3px] border-[var(--ink)] bg-[var(--electric)] px-4 py-2 font-display text-xs font-black uppercase transition-transform hover:-translate-y-0.5">
                      Bid
                    </button>
                  </div>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- testimonials ---------------- */

function Testimonials() {
  const items = [
    { name: "Maya R.", role: "Sneaker collector", img: avatar2, c: "var(--electric)", q: "Won my grail pair in 4 minutes. The auto-bid is genius. Felt like cheating, but legal." },
    { name: "Devon K.", role: "Vintage seller", img: avatar1, c: "var(--acid)", q: "Listed a Walkman at lunch. Sold for 3x my estimate by dinner. The AI pricing knows things." },
    { name: "Sam P.", role: "Art curator", img: avatar3, c: "var(--hotpink)", q: "Finally an auction site that doesn't look like a 2007 forum. Beautiful AND it works." },
  ];
  return (
    <section className="px-6 py-24 md:px-16">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <h2 className="mb-12 font-display text-5xl font-black tracking-tighter md:text-7xl">Receipts. <span className="text-stroke">Real ones.</span></h2>
        </Reveal>
        <div className="grid gap-6 md:grid-cols-3">
          {items.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.08}>
              <motion.div whileHover={{ rotate: i % 2 ? 1 : -1, y: -4 }} className="brutal-lg flex h-full flex-col p-7" style={{ background: t.c }}>
                <Quote className="h-9 w-9" strokeWidth={2.5} />
                <p className="mt-4 flex-1 font-display text-xl font-bold leading-snug">“{t.q}”</p>
                <div className="mt-6 flex items-center gap-3">
                  <img src={t.img} alt={t.name} loading="lazy" width={48} height={48} className="h-12 w-12 rounded-full border-[3px] border-[var(--ink)] object-cover" />
                  <div>
                    <div className="font-display font-black">{t.name}</div>
                    <div className="text-xs text-[var(--ink)]/70">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- pricing ---------------- */

function Pricing() {
  const plans = [
    { name: "Bidder", price: "$0", per: "forever", c: "white", features: ["Bid on any auction", "Watchlist & alerts", "Standard support"], cta: "Sign up free" },
    { name: "Pro", price: "$12", per: "/ month", c: "var(--acid)", featured: true, features: ["Everything in Bidder", "AI Auction Agent", "Auto-bid + sniping", "Priority support"], cta: "Go Pro" },
    { name: "Seller", price: "5%", per: "per sale", c: "var(--electric)", features: ["List unlimited lots", "AI pricing & descriptions", "Stripe payouts", "Verified badge"], cta: "Start selling" },
  ];
  return (
    <section className="border-y-[3px] border-[var(--ink)] bg-white px-6 py-24 md:px-16">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <div className="mb-12 text-center">
            <h2 className="font-display text-5xl font-black tracking-tighter md:text-7xl">Pick your <span className="inline-block rotate-1 rounded-2xl border-[3px] border-[var(--ink)] bg-[var(--hotpink)] px-3">vibe.</span></h2>
            <p className="mx-auto mt-4 max-w-md text-[var(--ink)]/70">No hidden fees. No surprise charges. Cancel any time.</p>
          </div>
        </Reveal>
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((p, i) => (
            <Reveal key={p.name} delay={i * 0.08}>
              <motion.div whileHover={{ y: -6 }} className={`brutal-lg relative flex h-full flex-col p-8 ${p.featured ? "md:-translate-y-4" : ""}`} style={{ background: p.c }}>
                {p.featured && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full border-[3px] border-[var(--ink)] bg-[var(--ink)] px-4 py-1 font-display text-xs font-black uppercase text-[var(--acid)]">
                    Most popular
                  </div>
                )}
                <div className="font-display text-xl font-black uppercase">{p.name}</div>
                <div className="mt-4 flex items-end gap-2">
                  <div className="font-display text-6xl font-black leading-none">{p.price}</div>
                  <div className="pb-2 text-sm font-bold text-[var(--ink)]/70">{p.per}</div>
                </div>
                <ul className="mt-6 flex-1 space-y-3">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-[3px] border-[var(--ink)] bg-white">
                        <Check className="h-3.5 w-3.5" strokeWidth={3} />
                      </span>
                      <span className="font-medium">{f}</span>
                    </li>
                  ))}
                </ul>
                <button 
                  onClick={() => window.location.href = '/register'}
                  className="mt-8 w-full rounded-full border-[3px] border-[var(--ink)] bg-[var(--ink)] px-5 py-3 font-display text-sm font-black uppercase text-white shadow-[4px_4px_0_0_var(--ink)] transition-transform hover:-translate-y-0.5"
                >
                  {p.cta}
                </button>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- FAQ ---------------- */

function FAQ() {
  const faqs = [
    { q: "How does the AI Auction Agent actually work?", a: "It parses natural-language commands, queries our auction index, and can place bids within caps you set. You always stay in control." },
    { q: "Are sellers verified?", a: "Yes. Every seller passes ID + payout verification before they can list. You'll see a green ‘Verified’ badge on trustworthy lots." },
    { q: "What happens if I win?", a: "You get a notification, a Stripe checkout link, and shipping is arranged via the seller. We hold funds until you confirm receipt." },
    { q: "Is there a mobile app?", a: "The web app is fully responsive and PWA-ready. Native iOS / Android apps are launching this quarter." },
  ];
  const [open, setOpen] = useState(0);
  return (
    <section className="px-6 py-24 md:px-16">
      <div className="mx-auto max-w-4xl">
        <Reveal>
          <h2 className="mb-12 text-center font-display text-5xl font-black tracking-tighter md:text-7xl">Questions? Same.</h2>
        </Reveal>
        <div className="space-y-4">
          {faqs.map((f, i) => (
            <Reveal key={i} delay={i * 0.05}>
              <div className="brutal overflow-hidden bg-white">
                <button
                  onClick={() => setOpen(open === i ? -1 : i)}
                  className="flex w-full items-center justify-between gap-4 p-6 text-left"
                >
                  <span className="font-display text-lg font-black md:text-xl">{f.q}</span>
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-[3px] border-[var(--ink)] bg-[var(--acid)]">
                    {open === i ? <Minus className="h-5 w-5" strokeWidth={3} /> : <Plus className="h-5 w-5" strokeWidth={3} />}
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {open === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="px-6 pb-6 text-[var(--ink)]/80">{f.a}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- CTA ---------------- */

function CTA() {
  return (
    <section className="px-6 pb-32 pt-12 md:px-16">
      <Reveal>
        <div className="brutal-lg relative mx-auto max-w-6xl overflow-hidden p-10 md:p-20" style={{ background: "var(--ink)" }}>
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 animate-blob bg-[var(--acid)]" />
          <div className="pointer-events-none absolute -bottom-16 -left-10 h-52 w-52 rounded-full bg-[var(--hotpink)]" />
          <div className="relative">
            <h2 className="max-w-3xl font-display text-5xl font-black leading-[0.95] tracking-tighter text-white md:text-7xl">
              Ready to make your <span className="text-[var(--acid)]">first bid?</span>
            </h2>
            <p className="mt-6 max-w-xl text-white/80 md:text-lg">Join 120,000+ collectors and creators flipping the auction game.</p>
            <div className="mt-10 flex flex-wrap gap-4">
              <MagneticButton bg="var(--acid)" onClick={() => window.location.href = '/register'}>Create free account</MagneticButton>
              <MagneticButton bg="var(--hotpink)" onClick={() => window.location.href = '/login'}>Browse auctions</MagneticButton>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ---------------- footer ---------------- */

function Footer() {
  return (
    <footer className="border-t-[3px] border-[var(--ink)] bg-white px-6 py-12 md:px-16">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-[3px] border-[var(--ink)] bg-[var(--acid)] font-display text-lg font-black">IB</div>
            <span className="font-display text-2xl font-black">IntelliBid</span>
          </div>
          <p className="mt-4 max-w-sm text-[var(--ink)]/70">The AI-powered auction playground. Bid smarter, win louder.</p>
        </div>
        {[
          { h: "Product", l: ["Auctions", "Sellers", "Pricing", "Agent Mode"] },
          { h: "Company", l: ["About", "Careers", "Press", "Contact"] },
        ].map((col) => (
          <div key={col.h}>
            <div className="font-display text-sm font-black uppercase">{col.h}</div>
            <ul className="mt-4 space-y-2">
              {col.l.map((x) => <li key={x}><a href="#" className="text-[var(--ink)]/70 hover:text-[var(--ink)]">{x}</a></li>)}
            </ul>
          </div>
        ))}
      </div>
      <div className="mx-auto mt-10 flex max-w-7xl flex-wrap items-center justify-between gap-4 border-t-[3px] border-[var(--ink)] pt-6 text-sm">
        <div className="text-[var(--ink)]/60">© 2026 IntelliBid. Bid loud.</div>
        <div className="flex gap-5 font-display text-xs font-bold uppercase">
          <a href="#">Privacy</a><a href="#">Terms</a><a href="#">Cookies</a>
        </div>
      </div>
    </footer>
  );
}

/* ---------------- scroll progress ---------------- */

function ScrollProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      setP((h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div className="fixed left-0 top-0 z-[60] h-1.5 w-full bg-transparent">
      <div className="h-full bg-[var(--hotpink)] transition-[width] duration-75" style={{ width: `${p}%` }} />
    </div>
  );
}

/* ---------------- root ---------------- */

export default function IntelliBidLanding() {
  return (
    <div className="relative min-h-screen bg-[var(--background)] text-[var(--ink)]">
      <ScrollProgress />
      <LiquidCursor />
      <TopBar />
      <div>
        <Hero />
        <Marquee />
        <Categories />
        <Bento />
        <AgentDemo />
        <HowItWorks />
        <LiveAuctions />
        <Testimonials />
        <Pricing />
        <FAQ />
        <CTA />
        <Footer />
      </div>
    </div>
  );
}
