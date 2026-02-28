'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Sparkles, Mail, Lock, User, Loader2 } from 'lucide-react';

export default function RegisterPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        const form = e.currentTarget;
        const name = (form.elements.namedItem('name') as HTMLInputElement).value;
        const email = (form.elements.namedItem('email') as HTMLInputElement).value;
        const password = (form.elements.namedItem('password') as HTMLInputElement).value;

        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Registration failed');

            toast.success('Account created! Please sign in.');
            router.push('/auth/login');
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'Registration failed');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(160deg, var(--charcoal) 0%, var(--charcoal-800) 50%, #1e1a35 100%)',
            padding: '24px',
        }}>
            <div style={{
                background: 'var(--white)', borderRadius: 'var(--r-xl)',
                padding: '48px', width: '100%', maxWidth: 420,
                boxShadow: '0 24px 80px rgba(0,0,0,0.3)',
                animation: 'fadeUp 0.5s ease',
            }}>
                <div className="text-center mb-6">
                    <div style={{
                        width: 48, height: 48, borderRadius: 12,
                        background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 16px',
                    }}>
                        <Sparkles size={22} color="white" />
                    </div>
                    <h1 className="font-serif" style={{ fontSize: '1.6rem', marginBottom: 4 }}>Create account</h1>
                    <p className="text-secondary text-sm">Start generating jewelry campaigns free</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="name">Full Name</label>
                            <div style={{ position: 'relative' }}>
                                <User size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input id="name" name="name" type="text" className="form-input" placeholder="Jane Doe" required minLength={2} style={{ paddingLeft: 38 }} />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="email">Email</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input id="email" name="email" type="email" className="form-input" placeholder="you@example.com" required style={{ paddingLeft: 38 }} />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="password">Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input id="password" name="password" type="password" className="form-input" placeholder="Min. 6 characters" required minLength={6} style={{ paddingLeft: 38 }} />
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary w-full" style={{ justifyContent: 'center', marginTop: 8 }} disabled={loading}>
                            {loading ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Creating account...</> : 'Create Account'}
                        </button>
                    </div>
                </form>

                <div className="divider" />
                <p className="text-center text-sm text-secondary">
                    Already have an account?{' '}
                    <Link href="/auth/login" style={{ color: 'var(--gold-dark)', fontWeight: 600 }}>Sign in</Link>
                </p>
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
