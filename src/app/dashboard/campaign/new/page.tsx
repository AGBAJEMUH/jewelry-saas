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
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 bg-white rounded-3xl shadow-sm border border-[var(--border)]">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-[var(--gold)] to-[var(--gold-dark)] flex items-center justify-center mb-8 shadow-xl animate-bounce">
                    <Wand2 size={40} color="white" className="md:w-12 md:h-12" />
                </div>
                <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl text-center mb-4 text-[var(--charcoal)]">
                    Crafting Your Campaign
                </h2>
                <div className="flex items-center gap-3 text-secondary bg-[var(--surface-alt)] px-6 py-3 rounded-full shadow-inner">
                    <Loader2 size={18} className="animate-spin text-[var(--gold-dark)]" />
                    <span className="text-sm md:text-base font-medium">{loadingStatus}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in pb-32">
            <div className="mb-10">
                <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl text-[var(--charcoal)] mb-3">New Campaign</h1>
                <p className="text-secondary text-lg max-w-2xl">Upload product photos and configure your marketing tone to let Lumière AI work its magic.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid gap-8 lg:grid-cols-12">

                    {/* LEFT COLUMN: SETTINGS */}
                    <div className="lg:col-span-12 space-y-8">
                        <div className="card p-6 md:p-8 lg:p-10 border border-[var(--border)] shadow-sm">
                            <h2 className="text-xl md:text-2xl font-serif mb-8 flex items-center gap-3">
                                <Sparkles size={24} className="text-[var(--gold)]" />
                                1. Campaign Settings
                            </h2>

                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="form-label font-semibold text-[var(--charcoal)] text-sm" htmlFor="title">Campaign Title</label>
                                    <input id="title" required value={title} onChange={e => setTitle(e.target.value)} className="form-input focus:ring-2 focus:ring-[var(--gold-200)]" placeholder="e.g. Summer Bridal Collection" />
                                </div>
                                <div className="space-y-2">
                                    <label className="form-label font-semibold text-[var(--charcoal)] text-sm" htmlFor="theme">Niche / Theme</label>
                                    <input id="theme" required value={theme} onChange={e => setTheme(e.target.value)} className="form-input focus:ring-2 focus:ring-[var(--gold-200)]" placeholder="e.g. Fine Jewelry, Engagement Rings" />
                                </div>
                            </div>

                            <div className="mt-8 space-y-4">
                                <label className="form-label font-semibold text-[var(--charcoal)] text-sm">Brand Tone & Visual Style</label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4">
                                    {TONES.map(t => (
                                        <button
                                            key={t}
                                            type="button"
                                            onClick={() => setTone(t)}
                                            className={`py-4 px-2 rounded-xl border-2 transition-all duration-200 font-bold text-sm ${tone === t
                                                ? 'bg-[var(--gold-50)] border-[var(--gold)] text-[var(--gold-dark)] shadow-sm'
                                                : 'bg-white border-gray-100 text-secondary hover:border-gray-200'
                                                }`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* UPLOAD SECTION */}
                        <div className="card p-6 md:p-8 lg:p-10 border border-[var(--border)] shadow-sm">
                            <h2 className="text-xl md:text-2xl font-serif mb-8 flex items-center gap-3">
                                <UploadCloud size={24} className="text-[var(--gold)]" />
                                2. Product Uploads
                            </h2>

                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-4 border-dashed border-[var(--gold-100)] hover:border-[var(--gold)] rounded-3xl p-10 md:p-16 text-center bg-[var(--gold-50)]/30 cursor-pointer transition-all duration-300 group"
                            >
                                <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileSelect} />
                                <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center mx-auto mb-6 shadow-md group-hover:scale-110 transition-transform duration-300">
                                    <UploadCloud size={32} className="text-[var(--gold-dark)]" />
                                </div>
                                <h3 className="text-xl font-bold mb-2 text-[var(--charcoal)]">Drop your jewelry photos here</h3>
                                <p className="text-secondary text-sm md:text-base mb-1">Click or drag & drop (up to 20 images)</p>
                                <p className="text-xs text-[var(--gold-600)] font-medium">JPG, PNG, WEBP • Max 5MB per file</p>
                            </div>

                            {images.length > 0 && (
                                <div className="mt-10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {images.map((img, i) => (
                                        <div key={img.id} className="bg-white border border-gray-100 rounded-2xl p-4 flex gap-4 shadow-sm hover:shadow-md transition-shadow group relative">
                                            <button
                                                type="button"
                                                onClick={() => removeImage(img.id)}
                                                className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[var(--red)] text-white border-4 border-white shadow-lg cursor-pointer flex items-center justify-center z-10 hover:scale-110 transition-transform"
                                            >
                                                <X size={16} />
                                            </button>

                                            <div className="w-24 h-32 md:w-28 md:h-36 flex-shrink-0 rounded-xl overflow-hidden shadow-inner">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={img.preview} alt={`preview ${i}`} className="w-full h-full object-cover" />
                                            </div>

                                            <div className="flex-1 space-y-2 min-w-0">
                                                <input placeholder="Name (e.g. Diamond Ring)" className="w-full bg-gray-50 border-none rounded-lg p-2 text-xs font-medium focus:ring-1 focus:ring-[var(--gold-200)]" value={img.name} onChange={e => updateImageField(img.id, 'name', e.target.value)} />
                                                <input placeholder="Price (e.g. $1,200)" className="w-full bg-gray-50 border-none rounded-lg p-2 text-xs font-medium focus:ring-1 focus:ring-[var(--gold-200)]" value={img.price} onChange={e => updateImageField(img.id, 'price', e.target.value)} />
                                                <textarea placeholder="Tell AI about this piece..." className="w-full bg-gray-50 border-none rounded-lg p-2 text-xs h-16 resize-none focus:ring-1 focus:ring-[var(--gold-200)]" value={img.description} onChange={e => updateImageField(img.id, 'description', e.target.value)} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* STICKY FOOTER */}
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-4xl bg-white/80 backdrop-blur-xl border border-white shadow-2xl rounded-3xl p-4 md:p-6 z-40 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[var(--gold-50)] flex items-center justify-center text-[var(--gold-dark)]">
                            <Sparkles size={20} />
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-bold text-[var(--charcoal)]">{images.length} Image{images.length !== 1 ? 's' : ''} ready</p>
                            <p className="text-[10px] text-secondary uppercase tracking-wider font-bold italic">Lumière AI Analysis Active</p>
                        </div>
                    </div>

                    <div className="flex gap-3 w-full sm:w-auto">
                        <button type="button" onClick={() => router.back()} className="btn btn-ghost px-6 flex-1 sm:flex-none">Cancel</button>
                        <button type="submit" className="btn btn-primary px-8 flex-1 sm:flex-none py-4 text-base shadow-lg shadow-[var(--gold-200)]">
                            Generate Campaign
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
