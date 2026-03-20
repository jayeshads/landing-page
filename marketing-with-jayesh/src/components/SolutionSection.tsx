import { Brain, Route, PenLine, ClipboardCheck } from "lucide-react";

const items = [
  { icon: Brain, title: "AI Review System Explained", desc: "Learn exactly how Meta's AI scans and flags your ads." },
  { icon: Route, title: "Bridge Page Strategy", desc: "Create compliant funnels that pass automated checks." },
  { icon: PenLine, title: "Compliance Copywriting", desc: "Write ad copy that converts without policy violations." },
  { icon: ClipboardCheck, title: "Pre-Launch Checklist", desc: "Verify every element before you hit publish." },
];

const SolutionSection = () => (
  <section className="relative py-20 md:py-28">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsla(217,91%,60%,0.06),transparent_60%)]" />
    <div className="container relative z-10">
      <h2 className="text-center font-heading text-3xl font-bold md:text-4xl lg:text-5xl">
        The <span className="text-gradient">Policy Decoder</span> System
      </h2>
      <p className="mt-4 text-center text-muted-foreground">Everything you need to stay compliant and profitable</p>

      <div className="mx-auto mt-12 grid max-w-4xl gap-6 sm:grid-cols-2">
        {items.map(({ icon: Icon, title, desc }, i) => (
          <div
            key={title}
            className="group glass rounded-2xl p-6 neon-border neon-border-hover hover-lift animate-fade-up"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all group-hover:glow-blue group-hover:bg-primary/20">
              <Icon className="h-6 w-6" />
            </div>
            <h3 className="font-heading text-lg font-semibold text-foreground">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default SolutionSection;
