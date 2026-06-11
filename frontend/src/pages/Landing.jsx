import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Bot, Cpu, Eye, Globe2, Shield, ShieldCheck, Sparkles, Zap } from "lucide-react";

const features = [
    { icon: Bot, title: "Advanced Bot Filter", desc: "200+ UA signatures, headless browser fingerprinting, JS challenge & honeypots." },
    { icon: Globe2, title: "GeoIP & ISP Targeting", desc: "Allow / deny by country, ASN and ISP using built-in static intel — zero API dependency." },
    { icon: ShieldCheck, title: "Datacenter Defense", desc: "Block AWS, GCP, Azure, OVH, DigitalOcean, Hetzner ranges out-of-the-box." },
    { icon: Eye, title: "Inspection Defense", desc: "Hide your money page from review crawlers, ad-policy bots and AdsTransparency referrers." },
    { icon: Cpu, title: "Edge-grade Decisions", desc: "Single hop redirect. < 40 ms decision pipeline. Built for paid traffic at scale." },
    { icon: Zap, title: "Real-time Analytics", desc: "Live click stream, decision reasons, top countries, block rate — all in one console." },
];

export default function Landing() {
    return (
        <div className="min-h-screen bg-[#050505] text-gray-100">
            {/* Nav */}
            <header className="sticky top-0 z-40 bg-black/60 backdrop-blur-xl border-b border-white/10">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2" data-testid="landing-logo">
                        <div className="h-8 w-8 grid place-items-center bg-[#00ff66] text-black font-black font-display">C</div>
                        <span className="font-display text-base font-black tracking-tight">CLOAKFORGE</span>
                    </Link>
                    <nav className="hidden md:flex items-center gap-6 text-sm font-mono text-gray-400">
                        <a href="#features" className="hover:text-white">Features</a>
                        <a href="#engine" className="hover:text-white">Engine</a>
                        <a href="#workflow" className="hover:text-white">Workflow</a>
                    </nav>
                    <div className="flex items-center gap-2">
                        <Link to="/login" data-testid="landing-login-link">
                            <Button variant="ghost" className="text-gray-300 hover:bg-white/5 rounded-none">Sign in</Button>
                        </Link>
                        <Link to="/register" data-testid="landing-register-btn">
                            <Button className="bg-[#00ff66] text-black hover:bg-[#1aff7a] font-display font-bold rounded-none">
                                Start free <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0 -z-10">
                    <img
                        src="https://images.pexels.com/photos/5380603/pexels-photo-5380603.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=900"
                        alt=""
                        className="w-full h-full object-cover opacity-25"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black via-black/85 to-[#050505]" />
                </div>
                <div className="relative terminal-grid">
                    <div className="max-w-7xl mx-auto px-6 pt-24 pb-32 grid lg:grid-cols-12 gap-10">
                        <div className="lg:col-span-7 space-y-7">
                            <div className="inline-flex items-center gap-2 border border-white/15 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-gray-400 font-mono">
                                <Sparkles className="h-3 w-3 text-[#00ff66]" /> bot.filter / v1.0 / static-intel
                            </div>
                            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter leading-[0.95]">
                                Show humans the offer.<br />
                                <span className="text-[#00ff66]">Hide it from bots.</span>
                            </h1>
                            <p className="text-gray-400 text-base sm:text-lg max-w-xl leading-relaxed">
                                CloakForge is a precision cloaking engine for paid-traffic operators.
                                Route real visitors to your money page and quietly serve a clean
                                safe page to ad reviewers, crawlers and datacenter scanners — in a
                                single redirect.
                            </p>
                            <div className="flex flex-wrap items-center gap-3">
                                <Link to="/register" data-testid="hero-cta-primary">
                                    <Button className="bg-[#00ff66] text-black hover:bg-[#1aff7a] font-display font-bold text-base px-6 py-6 rounded-none">
                                        Launch console <ArrowRight className="h-4 w-4 ml-2" />
                                    </Button>
                                </Link>
                                <Link to="/login" data-testid="hero-cta-secondary">
                                    <Button variant="outline" className="border-white/20 text-white hover:bg-white/5 rounded-none text-base px-6 py-6">
                                        Sign in
                                    </Button>
                                </Link>
                            </div>
                            <div className="pt-6 flex flex-wrap gap-x-10 gap-y-3 text-xs font-mono text-gray-500">
                                <div><span className="text-[#00ff66]">●</span> 200+ UA signatures</div>
                                <div><span className="text-[#00ff66]">●</span> 80+ datacenter CIDRs</div>
                                <div><span className="text-[#00ff66]">●</span> 8 ad-inspection referrers</div>
                                <div><span className="text-[#00ff66]">●</span> 0 external APIs</div>
                            </div>
                        </div>

                        <div className="lg:col-span-5 relative">
                            <div className="border border-white/10 bg-[#0a0a0c] p-5 font-mono text-[11px] leading-relaxed text-gray-400">
                                <div className="flex items-center gap-2 pb-3 border-b border-white/10 mb-3">
                                    <span className="h-2.5 w-2.5 bg-red-500/70" />
                                    <span className="h-2.5 w-2.5 bg-yellow-500/70" />
                                    <span className="h-2.5 w-2.5 bg-[#00ff66]" />
                                    <span className="ml-auto text-gray-500">cloak.log // live</span>
                                </div>
                                <pre className="whitespace-pre-wrap">
<span className="text-gray-500">{"// incoming request"}</span>{`
`}<span className="text-[#00ff66]">GET</span> /api/cloak/cmp_7f3b...{`
`}ip ............ 89.32.x.x{`
`}country ....... DE{`
`}ua ............ Mozilla/5.0 (iPhone; CPU iPhone OS 17_4...{`
`}referrer ...... facebook.com/{`
`}datacenter .... <span className="text-[#00ff66]">false</span>{`
`}known_bot ..... <span className="text-[#00ff66]">false</span>{`
`}headless ...... <span className="text-[#00ff66]">false</span>{`
`}{`
`}<span className="text-[#00ff66]">→ DECISION: MONEY</span>{`
`}<span className="text-gray-500">{"// redirect 302 → https://offer.example/lp"}</span>
                                </pre>
                                <div className="mt-4 border border-[#00ff66]/30 bg-[#00ff66]/5 p-2 text-[#00ff66] text-xs">
                                    ✓ human / paid traffic — money page served
                                </div>
                            </div>
                            <div className="absolute -bottom-6 -left-6 hidden lg:block border border-white/10 bg-[#0a0a0c] p-3 font-mono text-[11px] text-gray-400 w-56">
                                <div className="text-red-400 mb-1">⚠ BOT BLOCKED</div>
                                ip 8.34.218.4 (Google){`
`}reason: datacenter_ip{`
`}<span className="text-yellow-400">→ safe page served</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Ticker */}
            <section className="border-y border-white/10 bg-black/60 overflow-hidden">
                <div className="ticker-track flex gap-12 py-3 whitespace-nowrap font-mono text-xs text-gray-500">
                    {Array.from({ length: 2 }).map((_, i) => (
                        <div key={`ticker-${i}`} className="flex gap-12">
                            <span>GOOGLEBOT // BLOCKED</span>
                            <span>FACEBOOKEXTERNALHIT // BLOCKED</span>
                            <span>AHREFSBOT // BLOCKED</span>
                            <span>AWS 18.0.0.0/8 // BLOCKED</span>
                            <span>HEADLESS CHROME // BLOCKED</span>
                            <span>PUPPETEER // BLOCKED</span>
                            <span>TWITTERBOT // BLOCKED</span>
                            <span>SCRAPY // BLOCKED</span>
                            <span>GCP 35.184.0.0/13 // BLOCKED</span>
                            <span>HUMAN US 24.x // <span className="text-[#00ff66]">MONEY</span></span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features bento */}
            <section id="features" className="max-w-7xl mx-auto px-6 py-24">
                <div className="grid lg:grid-cols-12 gap-10 mb-12">
                    <div className="lg:col-span-5">
                        <div className="data-label">// 01 . capabilities</div>
                        <h2 className="font-display text-4xl sm:text-5xl font-black tracking-tighter mt-3">
                            A bot filter engineered<br /> for paid-traffic operators.
                        </h2>
                    </div>
                    <p className="lg:col-span-7 text-gray-400 leading-relaxed self-end">
                        Most cloakers ship one or two rules and call it a day. CloakForge stacks
                        UA fingerprinting, datacenter CIDRs, headless-browser detection, ad-inspection
                        referrer filters and per-country/device targeting into a single decision pipeline.
                    </p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/10">
                    {features.map(({ icon: Icon, title, desc }) => (
                        <div key={title} className="bg-[#08080a] p-8 hover:bg-[#0d0d10] transition-colors shimmer-border">
                            <Icon className="h-6 w-6 text-[#00ff66]" />
                            <h3 className="font-display text-xl font-bold mt-6">{title}</h3>
                            <p className="text-sm text-gray-400 mt-2 leading-relaxed">{desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Engine */}
            <section id="engine" className="border-t border-white/10 bg-[#08080a]">
                <div className="max-w-7xl mx-auto px-6 py-24 grid lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-6 relative">
                        <img
                            src="https://images.pexels.com/photos/37730212/pexels-photo-37730212.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=900"
                            alt="datacenter racks"
                            className="w-full h-[420px] object-cover border border-white/10 grayscale contrast-125"
                        />
                        <div className="absolute -bottom-5 -right-5 hidden md:block border border-white/15 bg-black/80 backdrop-blur p-4 font-mono text-[11px] w-64">
                            <div className="data-label mb-2">// signature.feed</div>
                            <div className="space-y-1 text-gray-400">
                                <div><span className="text-[#00ff66]">200+</span> bot UA patterns</div>
                                <div><span className="text-[#00ff66]">80+</span> datacenter CIDRs</div>
                                <div><span className="text-[#00ff66]">100%</span> static — no API key</div>
                            </div>
                        </div>
                    </div>
                    <div className="lg:col-span-6">
                        <div className="data-label">// 02 . the engine</div>
                        <h2 className="font-display text-4xl sm:text-5xl font-black tracking-tighter mt-3">
                            Static intel.<br /> Zero external calls.
                        </h2>
                        <p className="text-gray-400 mt-5 leading-relaxed">
                            CloakForge ships with a curated database of known bot fingerprints and
                            cloud / scanner network ranges. Every cloak decision happens locally — no
                            IPinfo, no MaxMind subscription, no rate limit. Your latency budget stays
                            under 40 ms and your traffic stays compliant.
                        </p>
                        <div className="grid grid-cols-2 gap-px bg-white/10 mt-8">
                            {[
                                ["UA Patterns", "200+"],
                                ["Datacenter CIDRs", "80+"],
                                ["Headless Hints", "6"],
                                ["Inspection Hosts", "8"],
                            ].map(([label, val]) => (
                                <div key={label} className="bg-[#0a0a0c] p-5">
                                    <div className="data-label">{label}</div>
                                    <div className="font-display text-3xl font-black mt-1 text-[#00ff66]">{val}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Workflow */}
            <section id="workflow" className="max-w-7xl mx-auto px-6 py-24">
                <div className="data-label">// 03 . workflow</div>
                <h2 className="font-display text-4xl sm:text-5xl font-black tracking-tighter mt-3 max-w-3xl">
                    Three steps from raw URL to bulletproof landing page.
                </h2>
                <div className="grid md:grid-cols-3 gap-px bg-white/10 mt-12">
                    {[
                        { n: "01", t: "Create campaign", d: "Drop in your money URL and safe URL. Pick countries, devices, OS and filter levels." },
                        { n: "02", t: "Drop the snippet", d: "Use the generated link, JS snippet or REST endpoint to route traffic through CloakForge." },
                        { n: "03", t: "Watch the console", d: "Real-time decision log, block reasons, top countries and conversion stats — all live." },
                    ].map(({ n, t, d }) => (
                        <div key={n} className="bg-[#08080a] p-8">
                            <div className="data-label text-[#00ff66]">{n}</div>
                            <h3 className="font-display text-2xl font-bold mt-3">{t}</h3>
                            <p className="text-sm text-gray-400 mt-3 leading-relaxed">{d}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="border-t border-white/10 bg-[#08080a]">
                <div className="max-w-7xl mx-auto px-6 py-20 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                    <div>
                        <h2 className="font-display text-3xl sm:text-4xl font-black tracking-tighter">
                            Stop wasting clicks on crawlers.
                        </h2>
                        <p className="text-gray-400 mt-3 font-mono text-sm">Free tier — admin@cloakforge.io / Admin@12345</p>
                    </div>
                    <Link to="/register" data-testid="footer-cta-primary">
                        <Button className="bg-[#00ff66] text-black hover:bg-[#1aff7a] font-display font-bold text-base px-8 py-6 rounded-none">
                            Launch console <Shield className="h-4 w-4 ml-2" />
                        </Button>
                    </Link>
                </div>
            </section>

            <footer className="border-t border-white/10 py-8 text-center text-xs font-mono text-gray-500">
                © {new Date().getFullYear()} CLOAKFORGE — Built for legal demonstrative & research workflows.
            </footer>
        </div>
    );
}
