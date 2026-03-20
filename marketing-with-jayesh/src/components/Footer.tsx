const Footer = () => (
  <footer className="relative pt-12 pb-8">
    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
    <div className="container text-center">
      <p className="font-heading text-sm font-semibold text-foreground">
        © Marketing With Jayesh
      </p>
      <div className="mt-4 flex items-center justify-center gap-6 text-xs text-muted-foreground">
        <a href="#" className="transition-colors hover:text-primary">Privacy Policy</a>
        <span className="text-border">•</span>
        <a href="#" className="transition-colors hover:text-primary">Terms & Conditions</a>
        <span className="text-border">•</span>
        <a href="#" className="transition-colors hover:text-primary">Support</a>
      </div>
      <p className="mt-4 text-xs leading-relaxed text-muted-foreground/60 max-w-lg mx-auto">
        This product is for educational purposes only and is not affiliated with Meta Platforms, Inc. Results may vary based on individual implementation.
      </p>
    </div>
  </footer>
);

export default Footer;
