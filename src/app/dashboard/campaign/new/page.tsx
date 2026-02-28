'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { UploadCloud, X, Loader2, Sparkles, Wand2 } from 'lucide-react';

const TONES = ['Luxury', 'Trendy', 'Minimal', 'Bold'];

interface PendingImage {
    id: string;
    file: File;
    preview: string;
    name: string;
    price: string;
    description: string;
}

export default function NewCampaignPage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [title, setTitle] = useState('My Fall Collection');
    const [theme, setTheme] = useState('jewelry');
    const [tone, setTone] = useState('Luxury');
    const [images, setImages] = useState<PendingImage[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingStatus, setLoadingStatus] = useState('');

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;

        const newFiles = Array.from(e.target.files);
        if (images.length + newFiles.length > 20) {
            toast.error('Maximum 20 images allowed per campaign');
            return;
        }

        const newPendingImages = newFiles.map(file => ({
            id: Math.random().toString(36).substring(7),
            file,
            preview: URL.createObjectURL(file),
            name: '',
            price: '',
            description: '',
        }));

        setImages(prev => [...prev, ...newPendingImages]);
        // reset input
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const removeImage = (id: string) => {
        setImages(prev => {
            const filtered = prev.filter(img => img.id !== id);
            const removed = prev.find(img => img.id === id);
            if (removed) URL.revokeObjectURL(removed.preview);
            return filtered;
        });
    };

    const updateImageField = (id: string, field: keyof PendingImage, value: string) => {
        setImages(prev => prev.map(img => img.id === id ? { ...img, [field]: value } : img));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (images.length === 0) {
            toast.error('Please upload at least one image');
            return;
        }

        try {
            setLoading(true);
            setLoadingStatus('Uploading images...');

            const formData = new FormData();
            formData.append('title', title);
            formData.append('theme', theme);
            formData.append('tone', tone);

            images.forEach(img => {
                formData.append('images', img.file);
                formData.append('names', img.name);
                formData.append('prices', img.price);
                formData.append('descriptions', img.description);
            });

            // 1. Upload Images
            const uploadRes = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });
            const uploadData = await uploadRes.json();
            if (!uploadRes.ok) throw new Error(uploadData.error || 'Upload failed');

            // 2. Generate Copy
            setLoadingStatus('AI is analyzing your jewelry and generating captions...');
            const genRes = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ campaignId: uploadData.campaignId }),
            });
            const genData = await genRes.json();
            if (!genRes.ok) throw new Error(genData.error || 'Generation failed');

            toast.success('Campaign generated successfully!');
            router.push(`/dashboard/campaign/${uploadData.campaignId}`);

        } catch (error: any) {
            toast.error(error.message);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ height: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{
                    width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24,
                    boxShadow: '0 12px 40px rgba(201,168,76,0.3)', animation: 'pulse 2s infinite',
                }}>
                    <Wand2 size={40} color="white" />
                </div>
                <h2 className="font-serif text-center" style={{ fontSize: '1.8rem', marginBottom: 8, color: 'var(--charcoal)' }}>
                    Crafting Your Campaign
                </h2>
                <p className="text-secondary text-center" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Loader2 size={16} style={{ animation: 'spin 1.5s linear infinite' }} />
                    {loadingStatus}
                </p>
                <style>{`@keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }`}</style>
            </div>
        );
    }

    return (
        <div className="animate-fade-in pb-20">
            <div className="mb-8">
                <h1 className="font-serif" style={{ fontSize: '2.2rem', marginBottom: 4 }}>New Campaign</h1>
                <p className="text-secondary">Upload product photos and configure your marketing tone.</p>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid gap-6">

                    {/* CONFIGURATION CARD */}
                    <div className="card card-body">
                        <h2 style={{ fontSize: '1.2rem', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Sparkles size={20} color="var(--gold)" />
                            1. Campaign Settings
                        </h2>
                        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
                            <div className="form-group">
                                <label className="form-label" htmlFor="title">Campaign Title</label>
                                <input id="title" required value={title} onChange={e => setTitle(e.target.value)} className="form-input" placeholder="e.g. Summer Bridal Collection" />
                            </div>
                            <div className="form-group">
                                <label className="form-label" htmlFor="theme">Niche / Theme</label>
                                <input id="theme" required value={theme} onChange={e => setTheme(e.target.value)} className="form-input" placeholder="e.g. Fine Jewelry, Engagement Rings" />
                            </div>
                        </div>

                        <div className="form-group mt-6">
                            <label className="form-label mb-2">Brand Tone & Visual Style</label>
                            <div className="flex gap-4 flex-wrap">
                                {TONES.map(t => (
                                    <button
                                        key={t} type="button" onClick={() => setTone(t)}
                                        className="btn"
                                        style={{
                                            padding: '12px 24px', flex: 1, minWidth: 120,
                                            background: tone === t ? 'rgba(201,168,76,0.1)' : 'var(--white)',
                                            color: tone === t ? 'var(--gold-dark)' : 'var(--text-secondary)',
                                            borderColor: tone === t ? 'var(--gold)' : 'var(--border)',
                                            borderWidth: 2, borderStyle: 'solid', borderRadius: 'var(--r-md)',
                                            transition: 'all 0.2s', fontWeight: 600,
                                        }}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* UPLOAD CARD */}
                    <div className="card card-body">
                        <h2 style={{ fontSize: '1.2rem', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <UploadCloud size={20} color="var(--gold)" />
                            2. Product Uploads
                        </h2>

                        <div
                            onClick={() => fileInputRef.current?.click()}
                            style={{
                                border: '2px dashed rgba(201,168,76,0.4)', borderRadius: 'var(--r-lg)',
                                padding: '40px 24px', textAlign: 'center', background: 'rgba(201,168,76,0.02)',
                                cursor: 'pointer', transition: 'all 0.2s',
                            }}
                            onMouseOver={e => e.currentTarget.style.borderColor = 'var(--gold)'}
                            onMouseOut={e => e.currentTarget.style.borderColor = 'rgba(201,168,76,0.4)'}
                        >
                            <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileSelect} style={{ display: 'none' }} />
                            <div style={{
                                width: 48, height: 48, borderRadius: '50%', background: 'var(--white)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 16px', boxShadow: 'var(--shadow-sm)'
                            }}>
                                <UploadCloud size={24} color="var(--gold-dark)" />
                            </div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 8, color: 'var(--charcoal)' }}>Click to upload images</h3>
                            <p className="text-secondary text-sm">PNG, JPG, WEBP formats up to 5MB.</p>
                            <p className="text-secondary text-sm">Maximum 20 images per campaign.</p>
                        </div>

                        {images.length > 0 && (
                            <div className="mt-8 grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
                                {images.map((img, i) => (
                                    <div key={img.id} style={{ display: 'flex', gap: 16, padding: 16, border: '1px solid var(--border)', borderRadius: 'var(--r-md)', position: 'relative' }}>
                                        <button type="button" onClick={() => removeImage(img.id)} style={{ position: 'absolute', top: -8, right: -8, width: 24, height: 24, borderRadius: '50%', background: 'var(--red)', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <X size={14} />
                                        </button>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={img.preview} alt={`preview ${i}`} style={{ width: 100, height: '100%', minHeight: 120, objectFit: 'cover', borderRadius: 'var(--r-sm)' }} />
                                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                                            <input placeholder="Product Name (Optional)" className="form-input" style={{ padding: '6px 10px', fontSize: '0.85rem' }} value={img.name} onChange={e => updateImageField(img.id, 'name', e.target.value)} />
                                            <input placeholder="Price (Optional)" className="form-input" style={{ padding: '6px 10px', fontSize: '0.85rem' }} value={img.price} onChange={e => updateImageField(img.id, 'price', e.target.value)} />
                                            <textarea placeholder="Metadata (Optional) AI will infer if blank" className="form-textarea" style={{ padding: '6px 10px', fontSize: '0.85rem', flex: 1, minHeight: 40 }} value={img.description} onChange={e => updateImageField(img.id, 'description', e.target.value)} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-4 mt-4" style={{
                        position: 'sticky', bottom: 20, background: 'rgba(255,255,255,0.9)',
                        padding: '16px 24px', borderRadius: 'var(--r-lg)', backdropFilter: 'blur(12px)',
                        boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)', zIndex: 10
                    }}>
                        <button type="button" onClick={() => router.back()} className="btn btn-ghost btn-lg">Cancel</button>
                        <button type="submit" className="btn btn-primary btn-lg">
                            <Sparkles size={18} /> Generate Campaign ({images.length} items)
                        </button>
                    </div>

                </div>
            </form>
        </div>
    );
}
