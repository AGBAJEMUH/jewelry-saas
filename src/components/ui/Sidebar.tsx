'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { LayoutDashboard, PlusCircle, History, Settings, LogOut, Sparkles } from 'lucide-react';

export default function Sidebar() {
    const pathname = usePathname();

    const links = [
        { name: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={20} /> },
        { name: 'New Campaign', href: '/dashboard/campaign/new', icon: <PlusCircle size={20} /> },
        { name: 'Settings', href: '/dashboard/settings', icon: <Settings size={20} /> },
    ];

    return (
        <div style={{
            width: 260, height: '100vh', position: 'sticky', top: 0,
            background: 'var(--white)', borderRight: '1px solid var(--border)',
            display: 'flex', flexDirection: 'column', padding: '24px 16px',
        }}>
            <div className="flex items-center gap-2 px-2" style={{ marginBottom: 40 }}>
                <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <Sparkles size={16} color="white" />
                </div>
                <span style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: '1.2rem', color: 'var(--charcoal)' }}>
                    Lumière AI
                </span>
            </div>

            <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {links.map((link) => {
                    const isActive = pathname === link.href || (link.href !== '/dashboard' && pathname.startsWith(link.href));
                    return (
                        <Link key={link.name} href={link.href} style={{
                            display: 'flex', alignItems: 'center', gap: 12,
                            padding: '10px 14px', borderRadius: 'var(--r-md)',
                            color: isActive ? 'var(--gold-dark)' : 'var(--text-secondary)',
                            background: isActive ? 'rgba(201,168,76,0.1)' : 'transparent',
                            fontWeight: isActive ? 600 : 500,
                            textDecoration: 'none', transition: 'all 0.2s',
                        }}>
                            {link.icon}
                            {link.name}
                        </Link>
                    );
                })}
            </nav>

            <button
                onClick={() => signOut({ callbackUrl: '/' })}
                style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 14px', borderRadius: 'var(--r-md)',
                    color: 'var(--text-secondary)', background: 'transparent', border: 'none',
                    fontWeight: 500, cursor: 'pointer', textAlign: 'left',
                    marginTop: 'auto', transition: 'all 0.2s',
                }}
                onMouseOver={(e) => e.currentTarget.style.color = 'var(--red)'}
                onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
            >
                <LogOut size={20} />
                Log Out
            </button>
        </div>
    );
}
