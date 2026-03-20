import { AlertTriangle, Ban, FileWarning, Bot } from "lucide-react";

const problems = [
  { icon: AlertTriangle, text: "Unacceptable Business Practices flags", color: "text-destructive" },
  { icon: Ban, text: "Personal attribute violations", color: "text-orange-400" },
  { icon: FileWarning, text: "Landing page mismatch errors", color: "text-yellow-400" },
  { icon: Bot, text: "AI-based automated rejection system", color: "text-red-400" },
];

const ProblemSection = () => (
  <section className="relative py-20 md:py-28">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,hsla(0,84%,60%,0.04),transparent_60%)]" />
    <div className="container relative z-10">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-heading text-3xl font-bold md:text-4xl lg:text-5xl">
          Why Most <span className="text-gradient-blue">Finance Ads</span> Fail
        </h2>
        <p className="mt-4 text-muted-foreground">The hidden barriers keeping your ads from going live</p>

        <div className="mt-12 space-y-4 text-left">
          {problems.map(({ icon: Icon, text, color }, i) => (
            <div
              key={text}
              className="glass rounded-xl p-5 neon-border neon-border-hover hover-lift flex items-start gap-4 animate-fade-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-destructive/10">
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <span className="text-foreground font-medium pt-1.5">{text}</span>
            </div>
          ))}
        </div>

        <div className="mt-10 glass rounded-xl p-4 neon-border inline-block">
          <p className="font-heading text-lg font-semibold text-gradient">
            Every rejected ad = lost money and wasted data
          </p>
        </div>
      </div>
    </div>
  </section>
);

export default ProblemSection;
