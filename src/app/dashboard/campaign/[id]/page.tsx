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
    captionWhatsapp: string | null;
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
    heroImageUrl: string | null;
    heroImagePrompt: string | null;
    masterCaptionInstagram: string | null;
    masterCaptionFacebook: string | null;
    masterCaptionTiktok: string | null;
    masterCaptionWhatsapp: string | null;
    masterHashtags: string[] | null;
    createdAt: string;
}

export default function CampaignResultsPage() {
    const { id } = useParams();
    const router = useRouter();

    const [data, setData] = useState<{ campaign: Campaign; products: Product[] } | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTabs, setActiveTabs] = useState<Record<string, 'instagram' | 'facebook' | 'tiktok' | 'whatsapp'>>({});
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
            tabs['master'] = 'instagram';
            body.products.forEach((p: Product) => { tabs[p.id] = 'instagram'; });
            setActiveTabs(tabs);
        } catch {
            toast.error('Failed to load campaign');
            router.push('/dashboard');
        } finally {
            setLoading(false);
        }
    }

    const setTab = (productId: string, tab: 'instagram' | 'facebook' | 'tiktok' | 'whatsapp') => {
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

    const handleShare = async (text: string, platform: 'instagram' | 'facebook' | 'tiktok' | 'whatsapp') => {
        const shareData = {
            title: 'Jewelry Campaign',
            text: text,
        };

        if (platform === 'whatsapp') {
            window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
            return;
        }

        // For others, copy to clipboard as a fallback/companion to opening the app
        navigator.clipboard.writeText(text);
        toast.success('Caption copied! Open the app to paste.');

        if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                // Ignore aborts
            }
        }
    };

    const handleDownload = async (imageUrl: string, filename: string) => {
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast.success('Download started!');
        } catch (err) {
            window.open(imageUrl, '_blank');
            toast.error('Direct download failed, opening in new tab');
        }
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
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                    <div>
                        <h1 className="font-serif text-3xl md:text-4xl" style={{ marginBottom: 8 }}>{campaign.title}</h1>
                        <div className="flex flex-wrap gap-2 items-center text-sm text-secondary">
                            <span className="badge badge-gold">{campaign.tone} Tone</span>
                            <span className="badge badge-charcoal">{campaign.theme}</span>
                            <span>•</span>
                            <span>{products.length} Products</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Master Campaign Poster Card */}
            {campaign.heroImageUrl && (
                <div className="mb-12">
                    <h2 className="font-serif text-2xl mb-4 text-[var(--charcoal)]">Campaign Master Poster</h2>
                    <div className="card overflow-hidden flex flex-col lg:flex-row shadow-2xl border-2 border-[var(--gold-200)]">
                        {/* Poster Image */}
                        <div className="w-full lg:w-1/2 bg-[var(--charcoal)] relative group">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={campaign.heroImageUrl}
                                alt="Campaign Poster"
                                className="w-full h-full object-cover aspect-square sm:aspect-video lg:aspect-square"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button
                                    onClick={() => handleDownload(campaign.heroImageUrl!, `campaign-${campaign.id}-poster.jpg`)}
                                    className="btn btn-primary rounded-full"
                                >
                                    <Download size={18} className="mr-2" /> Download Poster
                                </button>
                            </div>
                        </div>

                        {/* Master Copy */}
                        <div className="card-body p-6 md:p-10 lg:w-1/2 flex flex-col justify-center">
                            <div className="mb-6">
                                <h3 className="font-serif text-2xl border-b-2 border-[var(--gold)] pb-1 inline-block mb-4">Master Campaign Copy</h3>
                                <p className="text-sm text-secondary italic mb-6">"This AI-generated copy summarizes your entire {campaign.theme} collection in a {campaign.tone} tone."</p>

                                <div className="tabs mb-4 overflow-x-auto whitespace-nowrap scrollbar-hide">
                                    {['instagram', 'facebook', 'tiktok', 'whatsapp'].map((t: any) => (
                                        <button
                                            key={t}
                                            className={`tab ${activeTabs['master'] === t ? 'active' : ''}`}
                                            onClick={() => setTab('master', t)}
                                        >
                                            <span className="capitalize">{t}</span>
                                        </button>
                                    ))}
                                </div>

                                <textarea
                                    className="form-textarea mb-4 w-full"
                                    value={
                                        activeTabs['master'] === 'instagram' ? campaign.masterCaptionInstagram || '' :
                                            activeTabs['master'] === 'facebook' ? campaign.masterCaptionFacebook || '' :
                                                activeTabs['master'] === 'tiktok' ? campaign.masterCaptionTiktok || '' :
                                                    campaign.masterCaptionWhatsapp || ''
                                    }
                                    readOnly
                                    style={{ minHeight: 140, background: 'var(--surface-alt)', border: 'none', fontSize: '0.95rem' }}
                                />

                                <div className="mb-6 flex flex-wrap gap-2">
                                    {(campaign.masterHashtags || []).map(t => (
                                        <span key={t} className="text-xs bg-gray-100 text-gray-600 rounded px-2 py-1 font-mono">#{t}</span>
                                    ))}
                                </div>

                                <div className="flex flex-wrap gap-3">
                                    <button
                                        className="btn btn-primary flex-1 min-w-[140px]"
                                        onClick={() => {
                                            const text = activeTabs['master'] === 'instagram' ? campaign.masterCaptionInstagram :
                                                activeTabs['master'] === 'facebook' ? campaign.masterCaptionFacebook :
                                                    activeTabs['master'] === 'tiktok' ? campaign.masterCaptionTiktok :
                                                        campaign.masterCaptionWhatsapp;
                                            handleShare(`${text}\n\n${(campaign.masterHashtags || []).map(h => `#${h}`).join(' ')}`, activeTabs['master'] as any);
                                        }}
                                    >
                                        Share Master Card
                                    </button>
                                    <button
                                        className="btn btn-outline"
                                        onClick={() => handleDownload(campaign.heroImageUrl!, `master-poster.jpg`)}
                                    >
                                        <Download size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <h2 className="font-serif text-2xl mb-6 text-[var(--charcoal)]">Individual Product Assets</h2>

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
                    if (currentTab === 'whatsapp') currentCaption = latestGen.captionWhatsapp || '';

                    return (
                        <div key={product.id} className="card overflow-hidden border border-[var(--border)] shadow-sm">
                            <div className="flex flex-col md:flex-row">
                                {/* Left side: Original Image & Product Info */}
                                <div className="w-full md:w-[320px] lg:w-[380px] bg-[var(--surface-alt)] flex flex-col border-b md:border-b-0 md:border-r border-[var(--border)]">
                                    <div className="relative aspect-square md:aspect-auto md:h-[300px]">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={product.imageUrl} alt="Source" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="p-6 bg-white flex-1">
                                        <h3 className="font-serif text-xl text-[var(--charcoal)] mb-2">{product.name}</h3>
                                        {latestGen.estimatedPrice && (
                                            <p className="text-emerald-600 text-sm font-bold mb-3">Est. Value: {latestGen.estimatedPrice}</p>
                                        )}
                                        <p className="text-secondary text-sm leading-relaxed">{product.description}</p>
                                    </div>
                                </div>

                                {/* Middle: Marketing Copy */}
                                <div className="flex-1 p-6 md:p-8 border-b md:border-b-0 md:border-r border-[var(--border)]">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="font-serif text-xl border-b-2 border-[var(--gold)] pb-1">Marketing Copy</h3>
                                        <button
                                            onClick={() => handleRegenerateText(product.id)}
                                            disabled={regeneratingText[product.id]}
                                            className="btn btn-ghost btn-sm text-[var(--gold-700)] hover:bg-[var(--gold-50)]"
                                        >
                                            {regeneratingText[product.id] ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                                            <span className="ml-2 hidden sm:inline">New Variation</span>
                                        </button>
                                    </div>

                                    <div className="tabs mb-4 overflow-x-auto whitespace-nowrap scrollbar-hide">
                                        {['instagram', 'facebook', 'tiktok', 'whatsapp'].map((t: any) => (
                                            <button
                                                key={t}
                                                className={`tab ${currentTab === t ? 'active' : ''}`}
                                                onClick={() => setTab(product.id, t)}
                                            >
                                                <span className="capitalize">{t}</span>
                                            </button>
                                        ))}
                                    </div>

                                    <textarea
                                        className="form-textarea w-full mb-4"
                                        value={currentCaption}
                                        readOnly
                                        style={{ minHeight: 140, background: 'var(--surface-alt)', border: 'none' }}
                                    />

                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {(latestGen.hashtags || []).map(t => (
                                            <span key={t} className="text-xs bg-gray-100 text-gray-500 rounded px-2 py-1 font-mono">#{t}</span>
                                        ))}
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            className="btn btn-primary btn-sm px-6"
                                            onClick={() => handleShare(`${currentCaption}\n\n${(latestGen.hashtags || []).map(t => `#${t}`).join(' ')}`, currentTab)}
                                        >
                                            {currentTab === 'whatsapp' ? 'Send to WhatsApp' : 'Share Now'}
                                        </button>
                                        <button
                                            className="btn btn-ghost btn-sm"
                                            onClick={() => {
                                                navigator.clipboard.writeText(`${currentCaption}\n\n${(latestGen.hashtags || []).map(t => `#${t}`).join(' ')}`);
                                                toast.success('Copied to clipboard!');
                                            }}
                                        >
                                            Copy
                                        </button>
                                    </div>
                                </div>

                                {/* Right: AI Promo Gen */}
                                <div className="w-full md:w-[300px] lg:w-[340px] p-6 bg-[var(--surface)] flex flex-col justify-center items-center text-center">
                                    <h3 className="font-serif text-lg mb-4 text-[var(--charcoal)]">Promotional Creative</h3>

                                    {latestGen.promoImageUrl ? (
                                        <div className="w-full relative group rounded-lg overflow-hidden shadow-md">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={latestGen.promoImageUrl} alt="Promo" className="w-full aspect-square object-cover" />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-4">
                                                <button
                                                    onClick={() => handleDownload(latestGen.promoImageUrl!, `promo-${product.id}.jpg`)}
                                                    className="btn btn-primary btn-sm rounded-full w-full"
                                                >
                                                    <Download size={16} className="mr-2" /> Download HQ
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="w-full aspect-square bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center p-6">
                                            <Layers size={32} className="text-[var(--gold)] mb-4" />
                                            <p className="text-sm font-medium mb-1">No creative yet</p>
                                            <p className="text-xs text-secondary mb-4">1 Credit required</p>
                                            <button
                                                onClick={() => handleGenerateImage(product.id, latestGen.id)}
                                                disabled={generatingImages[latestGen.id]}
                                                className="btn btn-outline btn-sm w-full"
                                            >
                                                {generatingImages[latestGen.id] ? <Loader2 size={14} className="animate-spin mr-2" /> : null}
                                                Generate Now
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
