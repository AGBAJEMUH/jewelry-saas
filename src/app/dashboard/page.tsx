'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Plus, Trash2, Loader2, Sparkles, Image as ImageIcon } from 'lucide-react';

interface CampaignSummary {
    id: string;
    title: string;
    theme: string;
    tone: string;
    status: string;
    createdAt: string;
    productCount: number;
    coverImage: string | null;
}

export default function DashboardPage() {
    const [campaigns, setCampaigns] = useState<CampaignSummary[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCampaigns();
    }, []);

    async function fetchCampaigns() {
        try {
            const res = await fetch('/api/campaigns');
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setCampaigns(data.campaigns);
        } catch {
            toast.error('Failed to load campaigns');
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(id: string, e: React.MouseEvent) {
        e.preventDefault();
        if (!confirm('Are you sure you want to delete this campaign?')) return;

        try {
            const res = await fetch(`/api/campaign/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error();
            toast.success('Campaign deleted');
            setCampaigns(campaigns.filter(c => c.id !== id));
        } catch {
            toast.error('Failed to delete campaign');
        }
    }

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 100 }}>
                <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--gold)' }} />
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
                <div>
                    <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl text-[var(--charcoal)] mb-2">Your Campaigns</h1>
                    <p className="text-secondary max-w-md">View and manage your generated jewelry marketing assets.</p>
                </div>
                <Link href="/dashboard/campaign/new" className="btn btn-primary px-8">
                    <Plus size={18} /> <span className="ml-2">New Campaign</span>
                </Link>
            </div>

            {campaigns.length === 0 ? (
                <div className="card text-center p-12 md:p-20 flex flex-col items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-[var(--gold-50)] flex items-center justify-center text-[var(--gold-dark)] mb-6">
                        <Sparkles size={32} />
                    </div>
                    <h2 className="text-2xl font-serif mb-4">No campaigns yet</h2>
                    <p className="text-secondary mb-8 max-w-md">
                        Upload your jewelry photos to generate AI-crafted captions, hashtags, and promotional images.
                    </p>
                    <Link href="/dashboard/campaign/new" className="btn btn-primary">
                        Create First Campaign
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
                    {campaigns.map((c) => (
                        <Link key={c.id} href={`/dashboard/campaign/${c.id}`} className="no-underline group">
                            <div className="card h-full flex flex-col relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-[var(--border)]">
                                <button
                                    onClick={(e) => handleDelete(c.id, e)}
                                    className="absolute top-4 right-4 z-10 w-10 h-10 rounded-xl bg-white/90 text-[var(--red)] flex items-center justify-center cursor-pointer shadow-sm lg:opacity-0 group-hover:opacity-100 transition-opacity duration-200 border-none"
                                    title="Delete Campaign"
                                >
                                    <Trash2 size={18} />
                                </button>

                                <div className="h-52 bg-[var(--surface-alt)] relative overflow-hidden">
                                    {c.coverImage ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={c.coverImage} alt={c.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                            <ImageIcon size={48} />
                                        </div>
                                    )}
                                    <div className="absolute bottom-4 left-4">
                                        <span className="badge badge-gold px-3 py-1 text-xs">
                                            {c.tone} Tone
                                        </span>
                                    </div>
                                </div>

                                <div className="p-6 flex-1 flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-xl font-serif text-[var(--charcoal)] mb-2 group-hover:text-[var(--gold-dark)] transition-colors">
                                            {c.title}
                                        </h3>
                                        <p className="text-sm text-secondary line-clamp-1">{c.theme}</p>
                                    </div>
                                    <div className="flex justify-between items-center text-xs text-secondary mt-6 border-t pt-4">
                                        <div className="flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)]"></span>
                                            <span>{c.productCount} Product{c.productCount !== 1 ? 's' : ''}</span>
                                        </div>
                                        <span>{new Date(c.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
