import { Button } from "@/components/ui/button";

const Navbar = () => (
  <nav className="sticky top-0 z-50 glass-strong">
    <div className="container flex h-16 items-center justify-between">
      <span className="font-heading text-lg font-bold tracking-tight text-foreground">
        Marketing With <span className="text-gradient">Jayesh</span>
      </span>
      <div className="flex items-center gap-4">
        <span className="hidden text-sm font-medium text-muted-foreground sm:block">
          Finance Edition v2.0
        </span>
        <Button size="sm" className="rounded-full bg-primary/20 text-primary hover:bg-primary/30 neon-border text-xs">
          Get Access
        </Button>
      </div>
    </div>
  </nav>
);

export default Navbar;
