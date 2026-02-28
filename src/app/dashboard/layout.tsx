import Sidebar from '@/components/ui/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen bg-[var(--surface)]">
            <Sidebar />
            <main className="flex-1 w-full max-w-[1400px] mx-auto p-4 md:p-8 lg:p-12 pt-20 lg:pt-12">
                {children}
            </main>
        </div>
    );
}
