import { Brain, LineChart, Settings, Home } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export const Sidebar = () => (
    <nav className="fixed left-0 top-0 h-full w-20 bg-black border-r border-zinc-900 flex flex-col items-center py-8 gap-8">
        <div className="text-emerald-500 font-bold text-xl">CH</div>
        <NavLink to="/dashboard" className="p-3 text-zinc-400 hover:text-white transition"><Home /></NavLink>
        <NavLink to="/models" className="p-3 text-zinc-400 hover:text-white transition"><Brain /></NavLink>
        <NavLink to="/analytics" className="p-3 text-zinc-400 hover:text-white transition"><LineChart /></NavLink>
        <div className="flex-1" />
        <NavLink to="/settings" className="p-3 text-zinc-400 hover:text-white transition"><Settings /></NavLink>
    </nav>
);
