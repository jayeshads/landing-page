import { ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const PricingSection = () => (
  <section className="relative py-20 md:py-28">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsla(217,91%,60%,0.08),transparent_50%)]" />
    <div className="container relative z-10">
      <div className="mx-auto max-w-md glass-strong rounded-3xl p-10 text-center glow-blue-strong neon-border animate-float" style={{ animationDuration: "8s" }}>
        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary neon-border mb-6">
          <Zap className="h-3 w-3" /> Limited Time Offer
        </div>

        <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">One-Time Payment</p>
        <div className="mt-4 flex items-baseline justify-center gap-3">
          <span className="text-lg text-muted-foreground line-through">$49</span>
          <span className="font-heading text-7xl font-extrabold text-gradient">$19</span>
        </div>

        <Button size="lg" className="mt-8 h-14 w-full rounded-full text-base font-bold shadow-lg shadow-primary/30 animate-pulse-glow btn-glow group">
          GET INSTANT ACCESS
          <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
        </Button>

        <p className="mt-5 text-xs text-muted-foreground">Instant delivery • No recurring fees • Lifetime access</p>
      </div>
    </div>
  </section>
);

export default PricingSection;
