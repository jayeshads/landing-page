import { Star } from "lucide-react";

const SocialProof = () => (
  <section className="relative py-16">
    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
    <div className="container text-center">
      <p className="font-heading text-lg font-semibold text-foreground">
        Trusted by <span className="text-gradient">1,000+</span> advertisers worldwide
      </p>
      <div className="mx-auto mt-8 max-w-xl glass rounded-2xl p-8 glow-blue neon-border hover-lift">
        <div className="mb-4 flex justify-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="h-5 w-5 fill-primary text-primary" />
          ))}
        </div>
        <p className="text-lg italic text-foreground">
          "This guide helped us fix rejection issues in under 24 hours."
        </p>
        <p className="mt-4 text-sm font-medium text-muted-foreground">— Agency Owner</p>
      </div>
    </div>
    <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
  </section>
);

export default SocialProof;
