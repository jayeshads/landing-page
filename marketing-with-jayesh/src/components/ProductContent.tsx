import { Check } from "lucide-react";

const topics = [
  "How Meta's AI review system actually works",
  "Common policy triggers for finance ads",
  "Bridge page structure that passes review",
  "Compliant copywriting frameworks & templates",
  "Pre-launch audit checklist (step-by-step)",
  "Real examples of approved finance ad creatives",
  "How to handle ad rejections & appeals",
  "Scaling strategies that stay compliant",
];

const ProductContent = () => (
  <section className="relative py-20 md:py-28">
    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-success/20 to-transparent" />
    <div className="container">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-heading text-3xl font-bold md:text-4xl lg:text-5xl">
          What You'll Learn <span className="text-gradient">Inside</span>
        </h2>
        <p className="mt-4 text-muted-foreground">
          A comprehensive system for Meta ad compliance
        </p>
      </div>

      <div className="mx-auto mt-12 max-w-2xl glass rounded-2xl p-8 neon-border glow-blue">
        <div className="space-y-4">
          {topics.map((topic, i) => (
            <div
              key={topic}
              className="flex items-start gap-3 animate-fade-up"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-success/15">
                <Check className="h-3.5 w-3.5 text-success" />
              </div>
              <span className="text-foreground">{topic}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default ProductContent;
