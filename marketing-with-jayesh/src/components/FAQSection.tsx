import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  { q: "Is this beginner friendly?", a: "Absolutely. The guide is written in plain language with step-by-step instructions anyone can follow, even if you've never run a finance ad before." },
  { q: "Does it work for finance ads?", a: "Yes — it's specifically built for the finance vertical. Every strategy, example, and framework is tailored to financial services advertising on Meta." },
  { q: "How will I receive the product?", a: "You'll get instant access via email immediately after purchase. The guide is delivered as a downloadable PDF." },
  { q: "Is it updated?", a: "Yes. This is version 2.0, updated to reflect Meta's latest policy enforcement changes and AI review system as of 2025." },
];

const FAQSection = () => (
  <section className="relative py-20 md:py-28">
    <div className="container">
      <h2 className="text-center font-heading text-3xl font-bold md:text-4xl lg:text-5xl">
        Frequently Asked <span className="text-gradient">Questions</span>
      </h2>
      <div className="mx-auto mt-10 max-w-2xl">
        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map(({ q, a }, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="glass rounded-xl neon-border neon-border-hover px-6 shadow-sm">
              <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline">
                {q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  </section>
);

export default FAQSection;
