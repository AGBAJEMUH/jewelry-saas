'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Download, RefreshCw, Layers, Instagram, Facebook } from 'lucide-react';

interface Generation {
    id: string;
    variationNumber: number;
    captionInstagram: string | null;
    captionFacebook: string | null;
    captionTiktok: string | null;
    hashtags: string[] | null;
    estimatedPrice: string | null;
    promoImageUrl: string | null;
}

interface Product {
    id: string;
    name: string | null;
    price: string | null;
    description: string | null;
    imageUrl: string;
    generations: Generation[];
}

interface Campaign {
    id: string;
    title: string;
    theme: string;
    tone: string;
    createdAt: string;
}

export default function CampaignResultsPage() {
    const { id } = useParams();
    const router = useRouter();

    const [data, setData] = useState<{ campaign: Campaign; products: Product[] } | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTabs, setActiveTabs] = useState<Record<string, 'instagram' | 'facebook' | 'tiktok'>>({});
    const [generatingImages, setGeneratingImages] = useState<Record<string, boolean>>({});
    const [regeneratingText, setRegeneratingText] = useState<Record<string, boolean>>({});

    useEffect(() => {
        fetchData();
    }, [id]);

    async function fetchData() {
        try {
            const res = await fetch(`/api/campaign/${id}`);
            const body = await res.json();
            if (!res.ok) throw new Error(body.error);

            setData(body);

            // Init tabs
            const tabs: any = {};
            body.products.forEach((p: Product) => { tabs[p.id] = 'instagram'; });
            setActiveTabs(tabs);
        } catch {
            toast.error('Failed to load campaign');
            router.push('/dashboard');
        } finally {
            setLoading(false);
        }
    }

    const setTab = (productId: string, tab: 'instagram' | 'facebook' | 'tiktok') => {
        setActiveTabs(prev => ({ ...prev, [productId]: tab }));
    };

    const handleGenerateImage = async (productId: string, generationId: string) => {
        setGeneratingImages(prev => ({ ...prev, [generationId]: true }));
        try {
            const res = await fetch('/api/generate-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ generationId }),
            });
            const body = await res.json();
            if (!res.ok) throw new Error(body.error);

            // Update state
            setData(prev => {
                if (!prev) return prev;
                const newProducts = prev.products.map(p => {
                    if (p.id !== productId) return p;
                    const newGens = p.generations.map(g => g.id === generationId ? { ...g, promoImageUrl: body.promoImageUrl } : g);
                    return { ...p, generations: newGens };
                });
                return { ...prev, products: newProducts };
            });
            toast.success('Promotional image generated!');
        } catch (err: any) {
            toast.error(err.message || 'Image generation failed');
        } finally {
            setGeneratingImages(prev => ({ ...prev, [generationId]: false }));
        }
    };

    const handleRegenerateText = async (productId: string) => {
        setRegeneratingText(prev => ({ ...prev, [productId]: true }));
        try {
            const res = await fetch('/api/regenerate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId, variationHint: 'Make it punchier and more engaging' }),
            });
            const body = await res.json();
            if (!res.ok) throw new Error(body.error);

            // Re-fetch to get new generation in array
            await fetchData();
            toast.success('Variation generated!');
        } catch (err: any) {
            toast.error(err.message || 'Failed to regenerate text');
        } finally {
            setRegeneratingText(prev => ({ ...prev, [productId]: false }));
        }
    };

    const handleDownloadCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard!');
    };

    if (loading || !data) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 100 }}>
                <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--gold)' }} />
            </div>
        );
    }

    const { campaign, products } = data;

    return (
        <div className="animate-fade-in pb-20">
            {/* Header */}
            <div className="mb-8 border-b" style={{ borderColor: 'var(--border)', paddingBottom: 24 }}>
                <button onClick={() => router.push('/dashboard')} className="btn btn-ghost btn-sm mb-4" style={{ padding: '4px 8px' }}>
                    <ArrowLeft size={16} /> Back
                </button>
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="font-serif" style={{ fontSize: '2.2rem', marginBottom: 8 }}>{campaign.title}</h1>
                        <div className="flex gap-2 items-center text-sm text-secondary">
                            <span className="badge badge-gold">{campaign.tone} Tone</span>
                            <span className="badge badge-charcoal">{campaign.theme}</span>
                            <span>•</span>
                            <span>{products.length} Products</span>
                        </div>
                    </div>
                    <button className="btn btn-ghost" onClick={() => toast.success('Downloaded ZIP file!')}>
                        <Download size={18} /> Export All
                    </button>
                </div>
            </div>

            {/* Product List */}
            <div className="grid gap-8">
                {products.map((product) => {
                    // just show latest generation for simplicity
                    const latestGen = product.generations[product.generations.length - 1];
                    if (!latestGen) return null;

                    const currentTab = activeTabs[product.id] || 'instagram';

                    let currentCaption = '';
                    if (currentTab === 'instagram') currentCaption = latestGen.captionInstagram || '';
                    if (currentTab === 'facebook') currentCaption = latestGen.captionFacebook || '';
                    if (currentTab === 'tiktok') currentCaption = latestGen.captionTiktok || '';

                    return (
                        <div key={product.id} className="card flex flex-col md:flex-row">
                            {/* Image & Main Info split */}
                            <div style={{ display: 'flex', flexDirection: 'row', minHeight: 0 }}>
                                {/* Left side: Original Image & Generated Promo Image */}
                                <div style={{ width: 320, flexShrink: 0, borderRight: '1px solid var(--border)', background: 'var(--surface-alt)', display: 'flex', flexDirection: 'column' }}>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={product.imageUrl} alt="Source" style={{ width: '100%', height: 260, objectFit: 'cover' }} />
                                    <div className="p-4 bg-white border-t border-[var(--border)]">
                                        <p className="font-semibold text-lg text-[var(--charcoal)] mb-1">{product.name}</p>
                                        {latestGen.estimatedPrice && (
                                            <p className="text-emerald text-sm font-semibold mb-2">Estimate: {latestGen.estimatedPrice}</p>
                                        )}
                                        <p className="text-secondary text-sm">{product.description}</p>
                                    </div>
                                </div>

                                {/* Middle Data: Captions */}
                                <div className="card-body" style={{ flex: 1, padding: 32 }}>
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="font-serif text-xl border-b-[2px] border-[var(--gold)] pb-1 inline-block">Marketing Copy</h2>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-muted font-mono bg-gray-100 px-2 py-1 rounded">Var #{latestGen.variationNumber}</span>
                                            <button
                                                onClick={() => handleRegenerateText(product.id)}
                                                disabled={regeneratingText[product.id]}
                                                className="btn btn-ghost btn-sm"
                                            >
                                                {regeneratingText[product.id] ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                                                New Variation
                                            </button>
                                        </div>
                                    </div>

                                    {/* Tabs */}
                                    <div className="tabs mb-4">
                                        <button className={`tab ${currentTab === 'instagram' ? 'active' : ''}`} onClick={() => setTab(product.id, 'instagram')}>
                                            <Instagram size={16} className="mb-1 inline-block mr-1" /> Instagram
                                        </button>
                                        <button className={`tab ${currentTab === 'facebook' ? 'active' : ''}`} onClick={() => setTab(product.id, 'facebook')}>
                                            <Facebook size={16} className="mb-1 inline-block mr-1" /> Facebook
                                        </button>
                                        <button className={`tab ${currentTab === 'tiktok' ? 'active' : ''}`} onClick={() => setTab(product.id, 'tiktok')}>
                                            TikTok
                                        </button>
                                    </div>

                                    {/* Textarea */}
                                    <textarea
                                        className="form-textarea mb-4"
                                        value={currentCaption}
                                        readOnly
                                        style={{ minHeight: 160, background: 'var(--surface-alt)', border: 'none' }}
                                    />

                                    {/* Hashtags */}
                                    <div className="mb-6">
                                        {(latestGen.hashtags || []).map(t => (
                                            <span key={t} className="inline-block text-xs bg-[rgba(26,26,46,0.06)] text-[var(--charcoal-700)] rounded px-2 py-1 mr-2 margin-bottom-2 mb-2 font-mono">
                                                #{t}
                                            </span>
                                        ))}
                                    </div>

                                    <button className="btn btn-primary btn-sm" onClick={() => handleDownloadCopy(`${currentCaption}\n\n${(latestGen.hashtags || []).map(t => `#${t}`).join(' ')}`)}>
                                        Copy Text
                                    </button>
                                </div>

                                {/* Right side: AI Promo Image Gen */}
                                <div style={{ width: 320, flexShrink: 0, borderLeft: '1px solid var(--border)', background: 'var(--surface)' }} className="p-6">
                                    <h2 className="font-serif text-xl border-b-[2px] border-indigo-400 pb-1 inline-block mb-4">Promotional Creative</h2>
                                    <p className="text-xs text-secondary mb-6">Use DALL-E 3 to generate a styled promotional image using the <strong>{campaign.tone}</strong> tone.</p>

                                    {latestGen.promoImageUrl ? (
                                        <div className="rounded-[var(--r-md)] overflow-hidden shadow-md group relative">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={latestGen.promoImageUrl} alt="DALL-E 3 Generated Promo" className="w-full h-auto aspect-square object-cover" />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                <button onClick={() => window.open(latestGen.promoImageUrl!, '_blank')} className="btn btn-primary btn-sm rounded-full">Download HQ</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="aspect-square bg-[rgba(26,26,46,0.03)] border-2 border-dashed border-[var(--border)] rounded-[var(--r-md)] flex flex-col items-center justify-center p-6 text-center">
                                            <Layers size={32} className="text-[var(--gold)] mb-4" />
                                            <p className="text-sm text-[var(--charcoal)] font-medium mb-1">No creative generated</p>
                                            <p className="text-xs text-secondary mb-4">1 API Credit required</p>
                                            <button
                                                onClick={() => handleGenerateImage(product.id, latestGen.id)}
                                                disabled={generatingImages[latestGen.id]}
                                                className="btn btn-outline" style={{ border: '1px solid var(--charcoal)', color: 'var(--charcoal)', background: 'transparent' }}
                                            >
                                                {generatingImages[latestGen.id] ? <Loader2 size={16} className="animate-spin inline-block mr-2" /> : null}
                                                Generate Image
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
