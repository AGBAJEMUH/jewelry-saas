'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Sparkles, Zap, Hash, Image, TrendingUp, Download, RefreshCw, History, ChevronRight, Star } from 'lucide-react';

const features = [
  { icon: <Image size={22} />, title: 'Vision AI Analysis', desc: 'GPT-4o analyzes your jewelry photos to infer names, descriptions, and pricing.' },
  { icon: <Sparkles size={22} />, title: 'AI Promo Images', desc: 'DALL-E 3 generates stunning styled promotional images per tone and platform.' },
  { icon: <Zap size={22} />, title: 'Platform Captions', desc: 'Optimized copy for Instagram, Facebook, and TikTok — all at once.' },
  { icon: <Hash size={22} />, title: 'Hashtag Engine', desc: '15–20 curated, algorithm-optimized hashtags for maximum organic reach.' },
  { icon: <RefreshCw size={22} />, title: 'Batch Variations', desc: 'Generate multiple creative variations per product with one click.' },
  { icon: <TrendingUp size={22} />, title: 'Price Estimator', desc: 'AI-powered price suggestions with confidence band based on visual analysis.' },
  { icon: <History size={22} />, title: 'Campaign History', desc: 'All your campaigns saved. Access, edit, and re-export any time.' },
  { icon: <Download size={22} />, title: 'Easy Exports', desc: 'Download captions and promotional images ready to post.' },
];

const tones = [
  { name: 'Luxury', desc: 'Editorial, elegant, aspirational', color: '#c9a84c' },
  { name: 'Trendy', desc: 'Fun, colorful, Gen-Z energy', color: '#8b5cf6' },
  { name: 'Minimal', desc: 'Clean, understated, Scandi', color: '#6b7280' },
  { name: 'Bold', desc: 'Dramatic, powerful, statement', color: '#ef4444' },
];

const plans = [
  { name: 'Free', price: '$0', features: ['5 campaigns/mo', '1 image per campaign', 'Caption generation', 'Basic hashtags'], cta: 'Get Started' },
  { name: 'Pro', price: '$29', period: '/mo', features: ['50 campaigns/mo', 'Up to 10 images', 'AI promo images', 'All tones', 'Priority AI'], cta: 'Start Free Trial', highlight: true },
  { name: 'Business', price: '$99', period: '/mo', features: ['Unlimited campaigns', 'Up to 20 images', 'All features', 'Analytics (soon)', 'Dedicated support'], cta: 'Contact Sales' },
];

export default function LandingPage() {
  const [activeTone, setActiveTone] = useState(0);

  return (
    <div style={{ background: 'var(--surface)' }}>
      {/* NAVBAR */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(250,249,247,0.9)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)', padding: '0 24px',
      }}>
        <div className="container flex items-center justify-between" style={{ height: 64 }}>
          <div className="flex items-center gap-2">
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Sparkles size={16} color="white" />
            </div>
            <span style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: '1.1rem', color: 'var(--charcoal)' }}>
              Lumière AI
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/auth/login" className="btn btn-ghost btn-sm">Sign In</Link>
            <Link href="/auth/register" className="btn btn-primary btn-sm">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{
        background: 'linear-gradient(160deg, var(--charcoal) 0%, var(--charcoal-800) 60%, #1e1a35 100%)',
        padding: '100px 24px 120px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative gold blobs */}
        <div style={{
          position: 'absolute', top: -80, right: -80, width: 400, height: 400,
          background: 'radial-gradient(circle, rgba(201,168,76,0.15) 0%, transparent 70%)',
          borderRadius: '50%',
        }} />
        <div style={{
          position: 'absolute', bottom: -60, left: -60, width: 300, height: 300,
          background: 'radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%)',
          borderRadius: '50%',
        }} />

        <div className="container text-center" style={{ position: 'relative' }}>
          <div className="flex justify-center mb-4">
            <span className="badge badge-gold" style={{ fontSize: '0.8rem' }}>
              <Sparkles size={12} /> Powered by GPT-4o Vision + DALL-E 3
            </span>
          </div>
          <h1 className="font-serif animate-fade-up" style={{
            fontSize: 'clamp(2.4rem, 6vw, 4rem)',
            color: 'var(--white)',
            lineHeight: 1.15,
            marginBottom: 20,
            maxWidth: 800,
            margin: '0 auto 20px',
          }}>
            Your Jewelry, Marketed by <span style={{ color: 'var(--gold-light)', fontStyle: 'italic' }}>AI</span>
          </h1>
          <p style={{
            fontSize: '1.1rem', color: 'rgba(255,255,255,0.7)',
            maxWidth: 560, margin: '0 auto 40px', lineHeight: 1.7,
          }}>
            Upload your product photos. Get platform-ready captions, hashtags, price estimates, and AI-generated promotional images — in under 30 seconds.
          </p>
          <div className="flex justify-center gap-2 flex-wrap">
            <Link href="/auth/register" className="btn btn-primary btn-lg">
              Start for Free <ChevronRight size={18} />
            </Link>
            <Link href="/auth/login" className="btn btn-lg" style={{
              background: 'rgba(255,255,255,0.1)', color: 'var(--white)',
              border: '1px solid rgba(255,255,255,0.2)',
              backdropFilter: 'blur(8px)',
            }}>
              Sign In
            </Link>
          </div>
          <p style={{ marginTop: 16, color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem' }}>
            No credit card required · Cancel anytime
          </p>
        </div>
      </section>

      {/* TONE SELECTOR SHOWCASE */}
      <section style={{ padding: '80px 24px', background: 'var(--white)' }}>
        <div className="container">
          <div className="text-center mb-6">
            <h2 className="font-serif" style={{ fontSize: '2rem', marginBottom: 8 }}>
              Four Brand Voices, Infinite Campaigns
            </h2>
            <p className="text-secondary">Each tone generates a distinct visual and copy style</p>
          </div>
          <div className="flex justify-center gap-2 flex-wrap mb-6">
            {tones.map((t, i) => (
              <button
                key={t.name}
                onClick={() => setActiveTone(i)}
                className="btn"
                style={{
                  background: activeTone === i ? t.color : 'transparent',
                  color: activeTone === i ? 'white' : 'var(--text-secondary)',
                  border: `2px solid ${t.color}`,
                  transition: 'all 0.2s',
                }}
              >
                {t.name}
              </button>
            ))}
          </div>
          <div className="card" style={{ maxWidth: 600, margin: '0 auto' }}>
            <div className="card-body text-center">
              <div style={{
                width: 200, height: 200, borderRadius: 'var(--r-lg)',
                background: `linear-gradient(135deg, ${tones[activeTone].color}20 0%, ${tones[activeTone].color}50 100%)`,
                margin: '0 auto 20px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Sparkles size={48} color={tones[activeTone].color} />
              </div>
              <span className="badge" style={{
                background: `${tones[activeTone].color}18`,
                color: tones[activeTone].color,
                border: `1px solid ${tones[activeTone].color}40`,
                marginBottom: 12,
              }}>
                {tones[activeTone].name} Tone
              </span>
              <p style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                "{tones[activeTone].desc}"
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section style={{ padding: '80px 24px' }}>
        <div className="container">
          <div className="text-center mb-6">
            <h2 className="font-serif" style={{ fontSize: '2rem', marginBottom: 8 }}>Everything You Need</h2>
            <p className="text-secondary">A complete marketing automation stack for jewelry brands</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
            {features.map((f) => (
              <div key={f.title} className="card" style={{ padding: 24 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 'var(--r-md)',
                  background: 'rgba(201,168,76,0.1)', color: 'var(--gold-dark)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 16,
                }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 6 }}>{f.title}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section >

      {/* PRICING */}
      < section style={{ padding: '80px 24px', background: 'var(--white)' }
      }>
        <div className="container">
          <div className="text-center mb-6">
            <h2 className="font-serif" style={{ fontSize: '2rem', marginBottom: 8 }}>Simple Pricing</h2>
            <p className="text-secondary">Start free, scale as you grow</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24, maxWidth: 900, margin: '0 auto' }}>
            {plans.map((plan) => (
              <div key={plan.name} className="card" style={{
                padding: 32, position: 'relative',
                border: plan.highlight ? '2px solid var(--gold)' : '1px solid var(--border)',
                transform: plan.highlight ? 'scale(1.03)' : 'none',
                boxShadow: plan.highlight ? 'var(--shadow-gold)' : 'var(--shadow-sm)',
              }}>
                {plan.highlight && (
                  <div style={{
                    position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                    background: 'linear-gradient(135deg, var(--gold), var(--gold-dark))',
                    color: 'white', padding: '4px 16px', borderRadius: 99,
                    fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4,
                  }}>
                    <Star size={10} /> Most Popular
                  </div>
                )}
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 4 }}>{plan.name}</h3>
                <div style={{ marginBottom: 20 }}>
                  <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--charcoal)' }}>{plan.price}</span>
                  {plan.period && <span className="text-secondary text-sm">{plan.period}</span>}
                </div>
                <ul style={{ listStyle: 'none', marginBottom: 24 }}>
                  {plan.features.map((f) => (
                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      <span style={{ color: 'var(--emerald)', fontWeight: 700 }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/auth/register"
                  className={`btn w-full ${plan.highlight ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ justifyContent: 'center' }}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section >

      {/* FOOTER */}
      < footer style={{
        background: 'var(--charcoal)', color: 'rgba(255,255,255,0.5)',
        padding: '40px 24px', textAlign: 'center', fontSize: '0.875rem',
      }}>
        <div className="flex justify-center items-center gap-2 mb-2">
          <div style={{
            width: 24, height: 24, borderRadius: 6,
            background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Sparkles size={12} color="white" />
          </div>
          <span style={{ color: 'white', fontFamily: 'Playfair Display, serif', fontWeight: 700 }}>Lumière AI</span>
        </div>
        <p>© 2026 Lumière AI · AI Jewelry Marketing Platform</p>
      </footer >
    </div >
  );
}
