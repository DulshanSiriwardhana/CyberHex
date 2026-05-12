import { Sidebar } from '../navbar/Sidebar';

export const Layout = ({ children }: { children: React.ReactNode }) => (
    <div className="flex min-h-screen bg-black text-zinc-100 font-sans">
        <Sidebar />
        <main className="ml-20 flex-1 p-8">
            {children}
        </main>
    </div>
);
