import { CheckCircle2 } from "lucide-react";

const benefits = [
  "Higher ad approval rate",
  "Lower account risk",
  "Stable campaign performance",
  "Better scaling ability",
];

const BenefitsSection = () => (
  <section className="relative py-20 md:py-28">
    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
    <div className="container">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-heading text-3xl font-bold md:text-4xl lg:text-5xl">
          What You'll <span className="text-gradient">Achieve</span>
        </h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {benefits.map((b, i) => (
            <div
              key={b}
              className="glass rounded-xl p-5 neon-border neon-border-hover hover-lift flex items-center gap-3 text-left animate-fade-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
              <span className="font-medium text-foreground">{b}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default BenefitsSection;
