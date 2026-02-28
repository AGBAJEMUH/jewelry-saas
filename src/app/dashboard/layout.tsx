import Sidebar from '@/components/ui/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--surface)' }}>
            <Sidebar />
            <main style={{ flex: 1, padding: '40px 48px', maxWidth: 1200 }}>
                {children}
            </main>
        </div>
    );
}
