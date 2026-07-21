import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, Sparkles, Image, CheckCircle, ChevronRight, RefreshCw, Eye, LayerGroup, Play } from 'lucide-react';
import { fetchWithAuth } from '@/lib/api';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  agentName?: string;
  text: string;
  options?: string[];
  toolCard?: {
    name: string;
    summary: string;
  };
}

export const AiChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'ai',
      agentName: 'Head Agent',
      text: "Namaste! Main aapka LeadPilot AI Manager hoon. Aap mujhe apne business ya product ke baare mein batao, main pura Meta Ads campaign structure, target audience, ad creatives aur landing page auto-generate karke ready kar dunga.",
      options: ['Start New Campaign', 'Optimize Existing Ads', 'Create Ad Creatives'],
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [agentTrail, setAgentTrail] = useState<string[]>(['Head Agent']);
  const [previewTab, setPreviewTab] = useState<'campaign' | 'ad' | 'landing'>('campaign');
  const [campaignPreview, setCampaignPreview] = useState<any>({
    name: 'Handmade Candles — Lead Gen Q3',
    objective: 'OUTCOME_LEADS',
    budget: '₹500 / day',
    placements: ['FB Feed', 'IG Feed', 'IG Stories'],
  });
  const [adPreview, setAdPreview] = useState<any>({
    headline: 'Get 20% OFF Organic Soy Candles',
    primary_text: 'Transform your home ambiance with 100% organic soy wax scented candles. Special discount today!',
    cta: 'Shop Now',
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (textToSend?: string) => {
    const messageText = textToSend || input;
    if (!messageText.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: messageText,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await fetchWithAuth('/ai/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageText }),
      });

      if (!res.ok || !res.body) {
        throw new Error('Streaming failed');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.replace('data: ', '').strip ? line.replace('data: ', '').trim() : line.replace('data: ', '');
            if (dataStr === '[DONE]') break;

            try {
              const data = JSON.parse(dataStr);

              if (data.type === 'agent_start') {
                setAgentTrail((prev) => (prev.includes(data.agent) ? prev : [...prev, data.agent]));
              } else if (data.type === 'tool_call') {
                // Flash tool execution
              } else if (data.type === 'preview_update') {
                if (data.payload) {
                  setCampaignPreview((prev: any) => ({ ...prev, ...data.payload }));
                }
              } else if (data.type === 'message') {
                const aiMsg: ChatMessage = {
                  id: Date.now().toString(),
                  sender: 'ai',
                  agentName: data.agent || 'Business Analyzer',
                  text: data.text,
                  options: data.options || [],
                };
                setMessages((prev) => [...prev, aiMsg]);
              }
            } catch (e) {
              // Ignore partial JSON chunks
            }
          }
        }
      }
    } catch (err) {
      // Fallback response for offline or dev
      const fallbackMsg: ChatMessage = {
        id: Date.now().toString(),
        sender: 'ai',
        agentName: 'Business Analyzer',
        text: `Maine aapka message ("${messageText}") process kar liya hai. Daily budget select kijiye:`,
        options: ['₹500 / day', '₹1,000 / day', '₹2,500 / day'],
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      setAgentTrail((prev) => (prev.includes('Business Analyzer') ? prev : [...prev, 'Business Analyzer']));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-6.5rem)] flex gap-4 overflow-hidden">
      {/* Left Chat Column */}
      <div className="flex-1 bg-[#12121A] border border-white/10 rounded-2xl flex flex-col overflow-hidden">
        {/* Chat Header & Agent Trail */}
        <div className="p-4 border-b border-white/10 flex flex-col gap-2 bg-[#0E0E14]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-blue-400" />
              <h2 className="font-bold text-white text-sm">AI Multi-Agent Campaign Orchestrator</h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">GPT-5.2 + Sonnet 4.5 + Gemini Flash</span>
          </div>

          {/* Agent Trail visualization */}
          <div className="flex items-center gap-2 overflow-x-auto text-[11px] pt-1">
            <span className="text-slate-400">Live Agent Trail:</span>
            {agentTrail.map((agent, idx) => (
              <React.Fragment key={idx}>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium whitespace-nowrap">
                  {agent}
                </span>
                {idx < agentTrail.length - 1 && <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              {msg.agentName && (
                <span className="text-[10px] font-semibold text-slate-400 mb-1 ml-1">
                  {msg.agentName}
                </span>
              )}

              <div
                className={`max-w-[85%] p-3.5 rounded-2xl text-sm ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none shadow-md shadow-blue-500/20'
                    : 'bg-slate-900 border border-white/10 text-slate-200 rounded-bl-none space-y-2'
                }`}
              >
                {msg.toolCard && (
                  <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                    <span className="font-semibold text-blue-400">{msg.toolCard.name}:</span>
                    <span className="truncate">{msg.toolCard.summary}</span>
                  </div>
                )}

                <p className="leading-relaxed">{msg.text}</p>
              </div>

              {/* Discrete options if present */}
              {msg.options && msg.options.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2 max-w-[85%]">
                  {msg.options.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(opt)}
                      className="text-xs px-3 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 transition-all font-medium"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Chat Input */}
        <div className="p-4 border-t border-white/10 bg-[#0E0E14]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe your business or product..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </form>
        </div>
      </div>

      {/* Right Live Preview Column */}
      <div className="w-[450px] bg-[#12121A] border border-white/10 rounded-2xl flex flex-col overflow-hidden hidden lg:flex">
        {/* Preview Tabs */}
        <div className="flex border-b border-white/10 bg-[#0E0E14]">
          {[
            { id: 'campaign', label: 'Campaign' },
            { id: 'ad', label: 'Ad Preview' },
            { id: 'landing', label: 'Landing Page' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setPreviewTab(tab.id as any)}
              className={`flex-1 py-3 text-xs font-semibold border-b-2 transition-all ${
                previewTab === tab.id
                  ? 'border-blue-500 text-blue-400 bg-white/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Live Preview Panel Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {previewTab === 'campaign' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-900 border border-white/10 space-y-2">
                <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">
                  Live Campaign Structure
                </span>
                <h3 className="font-bold text-white text-base">{campaignPreview.name}</h3>
                <div className="text-xs text-slate-400 space-y-1">
                  <p>• Objective: <span className="text-white">{campaignPreview.objective}</span></p>
                  <p>• Budget: <span className="text-white">{campaignPreview.budget}</span></p>
                  <p>• Placements: <span className="text-white">{campaignPreview.placements?.join(', ')}</span></p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-white/10 space-y-2">
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                  Target Audience Matrix
                </span>
                <h4 className="font-semibold text-white text-xs">Home Decor & Scented Candle Lovers</h4>
                <div className="flex flex-wrap gap-1.5 text-[11px] text-slate-300">
                  <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">India (21-45 yrs)</span>
                  <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">Interests: Home Scent</span>
                  <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">Aromatherapy</span>
                </div>
              </div>
            </div>
          )}

          {previewTab === 'ad' && (
            <div className="p-4 rounded-xl bg-slate-900 border border-white/10 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xs text-white">
                  C
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Candle Craft Co.</p>
                  <p className="text-[10px] text-slate-400">Sponsored • Meta Ad</p>
                </div>
              </div>
              <p className="text-xs text-slate-200">{adPreview.primary_text}</p>
              <div className="w-full h-48 rounded-lg bg-slate-800 border border-white/10 flex items-center justify-center text-slate-500 text-xs">
                AI Image Preview (Nano Banana / GPT Image 1)
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-white/10">
                <div>
                  <p className="text-xs font-bold text-white">{adPreview.headline}</p>
                  <p className="text-[10px] text-slate-400">candlecraft.yourapp.com</p>
                </div>
                <button className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold">
                  {adPreview.cta}
                </button>
              </div>
            </div>
          )}

          {previewTab === 'landing' && (
            <div className="p-4 rounded-xl bg-slate-900 border border-white/10 space-y-3">
              <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider">
                Generated Landing Page Template
              </span>
              <p className="text-xs text-slate-300">
                Template: <span className="font-semibold text-white">E-commerce Product Showcase v2</span>
              </p>
              <div className="w-full h-64 rounded-lg bg-slate-950 border border-white/10 p-3 text-xs text-slate-400 space-y-2">
                <div className="h-6 w-3/4 bg-slate-800 rounded" />
                <div className="h-4 w-1/2 bg-slate-800 rounded" />
                <div className="h-24 w-full bg-slate-900 rounded border border-white/5 flex items-center justify-center">
                  Product Hero Banner
                </div>
                <div className="h-8 w-full bg-blue-600/30 rounded border border-blue-500/40 flex items-center justify-center text-blue-300 font-semibold">
                  CTA Form: Enter Phone for Coupon
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
