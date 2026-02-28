'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { LayoutDashboard, PlusCircle, Settings, LogOut, Sparkles, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Sidebar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    const links = [
        { name: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={20} /> },
        { name: 'New Campaign', href: '/dashboard/campaign/new', icon: <PlusCircle size={20} /> },
        { name: 'Settings', href: '/dashboard/settings', icon: <Settings size={20} /> },
    ];

    const SidebarContent = () => (
        <>
            <div className="flex items-center gap-2 px-2 mb-10">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--gold)] to-[var(--gold-dark)] flex items-center justify-center">
                    <Sparkles size={16} color="white" />
                </div>
                <span className="font-serif font-bold text-xl text-[var(--charcoal)]">
                    Lumière AI
                </span>
            </div>

            <nav className="flex-1 flex flex-col gap-1.5">
                {links.map((link) => {
                    const isActive = pathname === link.href || (link.href !== '/dashboard' && pathname.startsWith(link.href));
                    return (
                        <Link
                            key={link.name}
                            href={link.href}
                            onClick={() => setIsOpen(false)}
                            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg transition-all duration-200 no-underline ${isActive ? 'text-[var(--gold-dark)] bg-[var(--gold-50)] font-semibold' : 'text-secondary hover:bg-gray-50 font-medium'
                                }`}
                        >
                            {link.icon}
                            {link.name}
                        </Link>
                    );
                })}
            </nav>

            <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-secondary hover:text-[var(--red)] transition-all duration-200 border-none bg-transparent cursor-pointer text-left font-medium mt-auto"
            >
                <LogOut size={20} />
                Log Out
            </button>
        </>
    );

    return (
        <>
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-[var(--border)] z-50 px-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--gold)] to-[var(--gold-dark)] flex items-center justify-center">
                        <Sparkles size={16} color="white" />
                    </div>
                    <span className="font-serif font-bold text-lg">Lumière AI</span>
                </div>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 text-[var(--charcoal)] bg-transparent border-none cursor-pointer"
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Backdrop */}
            {isOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-40 transition-opacity"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <div className={`lg:hidden fixed inset-y-0 left-0 w-[280px] bg-white z-50 p-6 flex flex-col transition-transform duration-300 ease-in-out transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <SidebarContent />
            </div>

            {/* Desktop Sidebar */}
            <div className="hidden lg:flex flex-col w-[260px] h-screen sticky top-0 bg-white border-r border-[var(--border)] p-6">
                <SidebarContent />
            </div>
        </>
    );
}
