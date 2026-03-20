import ebookMockup from "@/assets/ebook-mockup.png";

const ProductPreview = () => (
  <section className="relative py-20 md:py-28">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsla(217,91%,60%,0.08),transparent_60%)]" />
    <div className="container relative z-10 flex flex-col items-center text-center">
      <div className="animate-float">
        <img
          src={ebookMockup}
          alt="Meta Ad Policy Decoder - Finance Edition ebook"
          className="h-auto w-64 drop-shadow-[0_0_40px_hsla(217,91%,60%,0.3)] md:w-80"
          loading="lazy"
        />
      </div>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        {["Beginner Friendly", "Step-by-Step", "Finance Focused"].map((tag) => (
          <span key={tag} className="glass rounded-full neon-border px-5 py-2 text-sm font-medium text-primary">
            {tag}
          </span>
        ))}
      </div>
    </div>
  </section>
);

export default ProductPreview;
