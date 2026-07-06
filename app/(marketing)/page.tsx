"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Scan, Shirt, MessageCircle, Droplets, TrendingUp, Sparkles, ArrowRight, Users, Star } from "lucide-react";

const features = [
  {
    icon: Scan,
    title: "Face Analysis",
    description:
      "AI-powered facial analysis detects your face shape, skin tone, and concerns — then gives you personalized hairstyle, makeup, and skincare recommendations.",
  },
  {
    icon: Shirt,
    title: "Wardrobe Analysis",
    description:
      "Upload a full-body photo to get body type classification, color season analysis, and tailored outfit recommendations for every occasion.",
  },
  {
    icon: MessageCircle,
    title: "AI Stylist Chat",
    description:
      "Chat with your personal Luxe Mirror stylist — context-aware and powered by GPT-4o. It knows your face shape, skin type, and style goals.",
  },
  {
    icon: Droplets,
    title: "Skin Regime",
    description:
      "Get a personalized AM and PM skincare routine generated from your facial analysis. Step-by-step with product categories and reasons.",
  },
  {
    icon: TrendingUp,
    title: "Progress Timeline",
    description:
      "Every analysis is saved. Track how your style and skin have evolved over time with before/after comparisons and symmetry trends.",
  },
  {
    icon: Users,
    title: "Business Portal",
    description:
      "Salons, stylists, and aestheticians can manage clients, run analyses on their behalf, and generate branded PDF reports.",
  },
];

const faqs = [
  {
    q: "How accurate is the facial analysis?",
    a: "Luxe Mirror uses GPT-4o Vision — one of the most capable AI vision models available. Results are highly detailed and personalized, though they are recommendations, not medical diagnoses.",
  },
  {
    q: "Is my photo data private?",
    a: "Yes. Your photos are stored in a private Supabase bucket with Row Level Security enabled. Only you can access your own photos. You can delete your data at any time from settings.",
  },
  {
    q: "Who is Luxe Mirror for?",
    a: "It's built for individuals who want to look and feel their best, as well as professionals — salon owners, aestheticians, stylists, and plastic surgeons — who want an AI-powered tool for their clients.",
  },
  {
    q: "Do I need to pay?",
    a: "Luxe Mirror is fully free during the MVP phase. All features are unlocked for every account. Paid plans will be introduced later.",
  },
  {
    q: "What photos work best for analysis?",
    a: "For face analysis: a well-lit selfie, face centered, no heavy filters. For wardrobe: a full-body photo facing forward in natural light.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full gold-gradient flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-heading text-lg font-bold">
              Luxe <span className="gold-text">Mirror</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/sign-in">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link href="/sign-up">
              <Button size="sm" className="gold-gradient text-obsidian font-semibold">
                Get started free
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="bg-[var(--gold)]/15 text-[var(--gold)] border-[var(--gold)]/30 mb-4 px-4 py-1.5">
              <Sparkles className="w-3 h-3 mr-1.5" /> AI-Powered Personal Styling
            </Badge>
            <h1 className="font-heading text-5xl md:text-6xl font-bold text-foreground leading-tight">
              Your AI personal stylist,{" "}
              <span className="gold-text">always on.</span>
            </h1>
            <p className="text-xl text-muted-foreground mt-4 max-w-2xl mx-auto leading-relaxed">
              Facial analysis, wardrobe recommendations, skincare regimes, and a 24/7 AI chat stylist
              — all personalized to your unique features.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-3 justify-center pt-2"
          >
            <Link href="/sign-up">
              <Button size="lg" className="gold-gradient text-obsidian font-semibold px-8 h-12">
                Start for free <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button size="lg" variant="outline" className="h-12 px-8">
                Sign in
              </Button>
            </Link>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex items-center justify-center gap-4 pt-4"
          >
            <div className="flex -space-x-2">
              {["S", "A", "M", "T", "J"].map((l) => (
                <div
                  key={l}
                  className="w-8 h-8 rounded-full border-2 border-background gold-gradient flex items-center justify-center text-white text-xs font-bold"
                >
                  {l}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-[var(--gold)] text-[var(--gold)]" />
                ))}
              </div>
              Loved by stylists and beauty enthusiasts
            </div>
          </motion.div>
        </div>

        {/* Hero visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="max-w-3xl mx-auto mt-16"
        >
          <div className="glass rounded-3xl p-6 border border-[var(--gold)]/20">
            <div className="bg-gradient-to-br from-[var(--gold)]/10 to-[var(--blush)]/20 rounded-2xl p-8 text-center space-y-4">
              <div className="w-20 h-20 rounded-full gold-gradient mx-auto flex items-center justify-center">
                <Scan className="w-10 h-10 text-white" />
              </div>
              <div>
                <div className="inline-flex items-center gap-2 bg-white/60 rounded-full px-4 py-2 text-sm font-medium">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  Analyzing your features...
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
                {["Oval Face", "Warm Tone", "3 Hairstyles"].map((tag) => (
                  <div key={tag} className="bg-white/70 rounded-xl py-2 px-3 text-xs font-medium text-center">
                    {tag}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-heading text-4xl font-bold">Everything you need to look your best</h2>
            <p className="text-muted-foreground mt-3 text-lg max-w-xl mx-auto">
              Six AI-powered tools in one place — built for individuals and beauty professionals.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ icon: Icon, title, description }) => (
              <Card key={title} className="hover:border-[var(--gold)]/30 hover:shadow-md transition-all group">
                <CardContent className="p-6 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--gold)]/10 flex items-center justify-center group-hover:bg-[var(--gold)]/20 transition-colors">
                    <Icon className="w-5 h-5 text-[var(--gold)]" />
                  </div>
                  <h3 className="font-heading font-semibold text-lg">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-heading text-4xl font-bold mb-4">Built for everyone in beauty</h2>
          <p className="text-muted-foreground text-lg mb-12">From personal use to professional client management</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Individuals", desc: "Get a full personal style and skincare assessment — like having a luxury stylist on demand.", emoji: "🪞" },
              { title: "Salon Professionals", desc: "Run analyses for every client and deliver branded reports. Elevate your consultation experience.", emoji: "✂️" },
              { title: "Aestheticians & Surgeons", desc: "Document facial assessments, track progress over time, and share detailed reports with clients.", emoji: "🔬" },
            ].map(({ title, desc, emoji }) => (
              <Card key={title} className="hover:border-[var(--gold)]/30 transition-all">
                <CardContent className="p-6 text-center space-y-3">
                  <div className="text-4xl">{emoji}</div>
                  <h3 className="font-heading font-semibold text-lg">{title}</h3>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-heading text-4xl font-bold text-center mb-10">Questions & answers</h2>
          <Accordion className="space-y-2">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={i} className="bg-card border rounded-xl px-2">
                <AccordionTrigger className="font-medium text-left hover:no-underline px-4">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground px-4 pb-4">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <div className="w-16 h-16 rounded-full gold-gradient mx-auto flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="font-heading text-4xl font-bold">Start your style journey today</h2>
          <p className="text-muted-foreground text-lg">
            Free to use. No credit card required. Full access to every feature.
          </p>
          <Link href="/sign-up">
            <Button size="lg" className="gold-gradient text-obsidian font-semibold px-10 h-12">
              Create your account <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full gold-gradient flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <span className="font-heading font-bold">
              Luxe <span className="gold-text">Mirror</span>
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Luxe Mirror. Your AI personal stylist.
          </p>
        </div>
      </footer>
    </div>
  );
}
