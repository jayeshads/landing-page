const messages = [
  { text: "Bro ads approved instantly 🔥", side: "left" as const, time: "10:42 AM" },
  { text: "Wait really? Which guide?", side: "right" as const, time: "10:43 AM" },
  { text: "The Policy Decoder. Fixed all my rejection issues in one day", side: "left" as const, time: "10:44 AM" },
  { text: "Just bought it. Already seeing what I was doing wrong 😳", side: "right" as const, time: "10:52 AM" },
  { text: "Told you bro. Game changer for finance ads 💰", side: "left" as const, time: "10:53 AM" },
];

const TestimonialSection = () => (
  <section className="relative py-20 md:py-28">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,hsla(160,84%,50%,0.04),transparent_60%)]" />
    <div className="container relative z-10">
      <h2 className="text-center font-heading text-3xl font-bold md:text-4xl lg:text-5xl">
        Real <span className="text-gradient">Results</span>
      </h2>
      <p className="mt-4 text-center text-muted-foreground">What advertisers are saying</p>

      <div className="mx-auto mt-12 max-w-md space-y-3">
        {messages.map(({ text, side, time }, i) => (
          <div
            key={i}
            className={`flex animate-fade-up ${side === "right" ? "justify-end" : "justify-start"}`}
            style={{ animationDelay: `${i * 0.15}s` }}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                side === "left"
                  ? "glass neon-border rounded-bl-sm"
                  : "bg-primary/20 rounded-br-sm border border-primary/20"
              }`}
            >
              <p className="text-sm text-foreground">{text}</p>
              <p className="mt-1 text-[10px] text-muted-foreground text-right">{time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default TestimonialSection;
