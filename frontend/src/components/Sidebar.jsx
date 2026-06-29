import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  HardHat, 
  MapPin, 
  FileSpreadsheet, 
  LogOut, 
  Settings,
  Users,
  ChevronLeft,
  TrendingUp,
  FolderOpen,
  MessageSquare
} from 'lucide-react';

const Sidebar = ({ isOpen, setOpen }) => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-red-500/10 text-red-500 border border-red-500/20';
      case 'manager': return 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
      default: return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20';
    }
  };

  const menuItems = [
    { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Analytics', path: '/analytics', icon: TrendingUp },
    { name: 'Projects', path: '/projects', icon: FolderOpen },
    { name: 'Sites Directory', path: '/sites', icon: MapPin },
    { name: 'Messages', path: '/messages', icon: MessageSquare },
    { name: 'Reports Center', path: '/exports', icon: FileSpreadsheet },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-slate-200 bg-white transition-all duration-300 dark:border-slate-800 dark:bg-slate-900 md:static md:translate-x-0 ${isOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full md:w-20 md:translate-x-0'}`}>
      
      {/* Sidebar Header / Brand */}
      <div className="flex h-16 items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-accent-600 p-2 text-white">
            <HardHat size={20} />
          </div>
          <span className={`font-bold tracking-tight text-lg text-slate-800 dark:text-slate-100 transition-opacity duration-200 ${!isOpen && 'md:opacity-0 md:w-0 overflow-hidden'}`}>
            ConstructAI
          </span>
        </div>
        
        {/* Toggle Collapse on Mobile */}
        <button 
          onClick={() => setOpen(false)} 
          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden"
        >
          <ChevronLeft size={18} />
        </button>
      </div>

      {/* User Information Profile Summary */}
      <div className={`p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col items-center text-center transition-all ${!isOpen && 'md:p-4'}`}>
        <div className="relative mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-accent-100 text-xl font-bold text-accent-700 dark:bg-accent-950 dark:text-accent-300">
          {user.name.charAt(0)}
          <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-green-500 dark:border-slate-900"></span>
        </div>
        
        {isOpen ? (
          <>
            <h4 className="font-semibold text-slate-800 dark:text-slate-200">{user.name}</h4>
            <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getRoleBadgeColor(user.role)}`}>
              {user.role}
            </span>
          </>
        ) : (
          <span className="rounded-full bg-accent-500/10 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-accent-500">
            {user.role.charAt(0)}
          </span>
        )}
      </div>

      {/* Nav Links */}
      <nav className="flex-1 space-y-1.5 px-4 py-6">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => 
              `flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                isActive 
                  ? 'bg-accent-600 text-white shadow-premium shadow-accent-600/15' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'
              }`
            }
          >
            <item.icon size={20} />
            <span className={`transition-opacity duration-200 ${!isOpen && 'md:hidden md:w-0 overflow-hidden'}`}>
              {item.name}
            </span>
          </NavLink>
        ))}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-medium text-rose-500 hover:bg-rose-50/50 hover:text-rose-600 dark:hover:bg-rose-950/20"
        >
          <LogOut size={20} />
          <span className={`transition-opacity duration-200 ${!isOpen && 'md:hidden md:w-0 overflow-hidden'}`}>
            Sign Out
          </span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
