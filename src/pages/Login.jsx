import React, { useState } from 'react'
import { auth } from '../lib/auth'
import { ExternalLink, Zap, Trophy, Bot, Shield, ChevronRight, Check } from 'lucide-react'

const BOT_INVITE = `https://discord.com/api/oauth2/authorize?client_id=1525463657843261591&permissions=8&scope=bot%20applications.commands`

const PLANS = [
  {
    name: 'Starter',
    price: 'NPR 99',
    period: '/mo',
    color: 'from-slate-600 to-slate-700',
    badge: null,
    features: [
      '10 tournaments / month',
      'Basic bracket management',
      'Player registration',
      'Discord roles integration',
      'Community support',
    ],
  },
  {
    name: 'Pro',
    price: 'NPR 299',
    period: '/mo',
    color: 'from-indigo-600 to-purple-600',
    badge: 'Most Popular',
    features: [
      'Unlimited tournaments',
      'AI tournament control',
      'Auto match scheduling',
      'Advanced analytics',
      'Export registrations',
      'Priority support',
    ],
  },
  {
    name: 'Elite',
    price: 'NPR 399',
    period: '/mo',
    color: 'from-amber-500 to-orange-600',
    badge: 'Full Access',
    features: [
      'Everything in Pro',
      'AI support agent',
      'Custom branding',
      'Auto meme/clip posts',
      'Daily Excel reports',
      'Dedicated manager',
    ],
  },
]

const FEATURES = [
  { icon: Trophy, title: 'Tournament Management', desc: 'Create, manage & track tournaments with slash commands' },
  { icon: Bot,    title: 'AI Powered',            desc: 'AI support agent, auto announcements & growth tips' },
  { icon: Zap,    title: 'Instant Setup',          desc: 'Bot creates all channels & roles automatically' },
  { icon: Shield, title: 'Secure Portal',          desc: 'Discord OAuth — no passwords, no risk' },
]

export default function Login() {
  const [hoveredPlan, setHoveredPlan] = useState(null)

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">

      {/* ── NAV ─────────────────────────────────────────────────────── */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/5 max-w-6xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-black text-white">N</div>
          <span className="font-bold tracking-tight text-lg">NexPlay</span>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={BOT_INVITE}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-sm text-gray-300 hover:text-white hover:border-indigo-500/50 hover:bg-indigo-600/10 transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Add Bot to Server
          </a>
          <button
            onClick={() => auth.startDiscordOAuth()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#5865F2] hover:bg-[#4752c4] text-white text-sm font-semibold transition-all"
          >
            Login
          </button>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto text-center px-6 pt-20 pb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-600/15 border border-indigo-500/20 text-indigo-400 text-xs font-medium mb-6">
          <Zap className="w-3 h-3" /> Discord Tournament SaaS
        </div>
        <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-5 leading-tight">
          Run tournaments on
          <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent"> Discord</span>
          <br />like a pro
        </h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto mb-10">
          NexPlay handles registrations, brackets, AI announcements, and analytics — all inside Discord with one bot.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => auth.startDiscordOAuth()}
            className="flex items-center justify-center gap-3 px-7 py-3.5 rounded-xl bg-[#5865F2] hover:bg-[#4752c4] text-white font-bold text-sm transition-all shadow-xl shadow-[#5865F2]/25 hover:scale-[1.02]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.031.056a19.9 19.9 0 0 0 5.993 3.03.077.077 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
            </svg>
            Login with Discord
          </button>
          <a
            href={BOT_INVITE}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl border border-white/10 text-gray-300 hover:text-white hover:border-white/20 hover:bg-white/5 font-semibold text-sm transition-all"
          >
            <ExternalLink className="w-4 h-4" />
            Add Bot to Server
          </a>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-[#0f0f16] border border-white/5 rounded-xl p-5 text-center">
              <div className="w-10 h-10 rounded-lg bg-indigo-600/20 flex items-center justify-center mx-auto mb-3">
                <Icon className="w-5 h-5 text-indigo-400" />
              </div>
              <p className="text-white text-sm font-semibold mb-1">{title}</p>
              <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING ─────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 pb-24" id="pricing">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">Simple Pricing</h2>
          <p className="text-gray-400 text-sm">Choose the plan that fits your server. Cancel anytime.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {PLANS.map((plan, i) => (
            <div
              key={plan.name}
              onMouseEnter={() => setHoveredPlan(i)}
              onMouseLeave={() => setHoveredPlan(null)}
              className={`relative bg-[#0f0f16] border rounded-2xl p-6 flex flex-col transition-all duration-200 ${
                plan.badge === 'Most Popular'
                  ? 'border-indigo-500/50 shadow-xl shadow-indigo-500/10'
                  : 'border-white/5 hover:border-white/10'
              } ${hoveredPlan === i ? 'scale-[1.02]' : ''}`}
            >
              {plan.badge && (
                <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${plan.color}`}>
                  {plan.badge}
                </div>
              )}

              {/* Header */}
              <div className="mb-5">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-3`}>
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-3xl font-black text-white">{plan.price}</span>
                  <span className="text-gray-500 text-sm">{plan.period}</span>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-2.5 flex-1 mb-6">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-gray-300">{f}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => auth.startDiscordOAuth()}
                className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                  plan.badge === 'Most Popular'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/20'
                    : 'bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 hover:border-white/20'
                }`}
              >
                Get Started <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-gray-600 mt-8">
          All plans include a free trial period. Payment via eSewa, Khalti, or bank transfer.
        </p>
      </section>

      {/* ── INVITE CTA ──────────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-6 pb-24">
        <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/10 border border-indigo-500/20 rounded-2xl p-8 text-center">
          <div className="w-12 h-12 rounded-xl bg-indigo-600/30 flex items-center justify-center mx-auto mb-4">
            <Bot className="w-6 h-6 text-indigo-400" />
          </div>
          <h3 className="text-xl font-bold mb-2">Ready to get started?</h3>
          <p className="text-gray-400 text-sm mb-6">Add NexPlay to your Discord server and run /setup. Channels and roles are created automatically.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href={BOT_INVITE}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all"
            >
              <ExternalLink className="w-4 h-4" />
              Add NexPlay Bot
            </a>
            <button
              onClick={() => auth.startDiscordOAuth()}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-white/10 text-gray-300 hover:text-white hover:bg-white/5 font-semibold text-sm transition-all"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.031.056a19.9 19.9 0 0 0 5.993 3.03.077.077 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
              </svg>
              Login to Dashboard
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-6 text-center text-xs text-gray-600">
        NexPlay Tournament System · nexplay-server-portal.vercel.app
      </footer>
    </div>
  )
}
