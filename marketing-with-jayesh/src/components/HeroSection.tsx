import { Shield, Download, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const HeroSection = () => (
  <section className="relative overflow-hidden py-24 md:py-36">
    {/* Radial glow */}
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center_top,hsla(217,91%,60%,0.12),transparent_60%)]" />
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />

    <div className="container relative z-10 text-center">
      <div className="mx-auto max-w-3xl">
        {/* Badge */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full glass neon-border px-5 py-2 text-sm font-medium text-primary animate-fade-up">
          <Shield className="h-4 w-4" />
          Meta Ad Compliance Guide for Finance
        </div>

        {/* Headline */}
        <h1 className="font-heading text-4xl font-extrabold leading-[1.1] tracking-tight md:text-6xl lg:text-7xl animate-fade-up" style={{ animationDelay: "0.1s" }}>
          Stop Getting Your{" "}
          <span className="text-gradient">Finance Ads</span>{" "}
          Rejected
        </h1>

        {/* Subheadline */}
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl animate-fade-up" style={{ animationDelay: "0.2s" }}>
          Understand how Meta's AI reviews your ads and fix approval issues with a structured, compliance-based approach.
        </p>

        {/* CTA */}
        <div className="mt-10 animate-fade-up" style={{ animationDelay: "0.3s" }}>
          <Button size="lg" className="group h-14 rounded-full px-10 text-base font-bold shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/40 animate-pulse-glow btn-glow">
            Get Instant Access — $19
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>

        {/* Trust icons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground animate-fade-up" style={{ animationDelay: "0.4s" }}>
          <span className="flex items-center gap-1.5"><Shield className="h-4 w-4 text-success" /> Secure Payment</span>
          <span className="flex items-center gap-1.5"><Download className="h-4 w-4 text-success" /> Instant Download</span>
          <span className="flex items-center gap-1.5"><Users className="h-4 w-4 text-success" /> Trusted by Marketers</span>
        </div>
      </div>
    </div>
  </section>
);

export default HeroSection;
