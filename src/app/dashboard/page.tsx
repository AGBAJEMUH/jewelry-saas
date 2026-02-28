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
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="font-serif" style={{ fontSize: '2.2rem', marginBottom: 4 }}>Your Campaigns</h1>
                    <p className="text-secondary">View and manage your generated jewelry marketing assets.</p>
                </div>
                <Link href="/dashboard/campaign/new" className="btn btn-primary">
                    <Plus size={18} /> New Campaign
                </Link>
            </div>

            {campaigns.length === 0 ? (
                <div className="card text-center" style={{ padding: '60px 24px' }}>
                    <div style={{
                        width: 64, height: 64, borderRadius: '50%', background: 'rgba(201,168,76,0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
                        color: 'var(--gold-dark)',
                    }}>
                        <Sparkles size={32} />
                    </div>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: 8 }}>No campaigns yet</h2>
                    <p className="text-secondary mb-6 max-w-md mx-auto">
                        Upload your jewelry photos to generate AI-crafted captions, hashtags, and promotional images.
                    </p>
                    <Link href="/dashboard/campaign/new" className="btn btn-primary">
                        Create First Campaign
                    </Link>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
                    {campaigns.map((c) => (
                        <Link key={c.id} href={`/dashboard/campaign/${c.id}`} style={{ textDecoration: 'none' }}>
                            <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                                <button
                                    onClick={(e) => handleDelete(c.id, e)}
                                    style={{
                                        position: 'absolute', top: 12, right: 12, zIndex: 10,
                                        width: 32, height: 32, borderRadius: 8, border: 'none',
                                        background: 'rgba(255,255,255,0.9)', color: 'var(--red)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        cursor: 'pointer', boxShadow: 'var(--shadow-sm)',
                                        opacity: 0, transition: 'opacity 0.2s'
                                    }}
                                    className="delete-btn"
                                >
                                    <Trash2 size={16} />
                                </button>
                                <div style={{ height: 180, background: 'var(--surface-alt)', position: 'relative', overflow: 'hidden' }}>
                                    {c.coverImage ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={c.coverImage} alt={c.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                                            <ImageIcon size={48} />
                                        </div>
                                    )}
                                    <div style={{ position: 'absolute', bottom: 12, left: 12 }}>
                                        <span className="badge badge-gold">
                                            {c.tone} Tone
                                        </span>
                                    </div>
                                </div>
                                <div className="card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--charcoal)', marginBottom: 4 }}>
                                        {c.title}
                                    </h3>
                                    <div className="flex justify-between items-center text-sm text-secondary mt-auto">
                                        <span>{c.productCount} Product{c.productCount !== 1 ? 's' : ''}</span>
                                        <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
            <style>{`
        .card:hover .delete-btn { opacity: 1 !important; }
      `}</style>
        </div>
    );
}
