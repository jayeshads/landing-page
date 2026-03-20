import { Lock, Zap, FileCheck } from "lucide-react";

const items = [
  { icon: Lock, label: "Secure Payment" },
  { icon: Zap, label: "Instant Access" },
  { icon: FileCheck, label: "Verified Digital Product" },
];

const TrustSection = () => (
  <section className="relative py-12">
    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
    <div className="container flex flex-wrap items-center justify-center gap-10">
      {items.map(({ icon: Icon, label }) => (
        <div key={label} className="flex items-center gap-2 text-muted-foreground">
          <Icon className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium">{label}</span>
        </div>
      ))}
    </div>
    <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
  </section>
);

export default TrustSection;
