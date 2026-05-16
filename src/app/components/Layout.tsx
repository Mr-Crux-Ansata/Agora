import { ReactNode, useState } from 'react';
import {
  Home,
  Map,
  Vote,
  MessageSquare,
  TrendingUp,
  Bell,
  User,
  Menu,
  X,
  Search,
  MapPin,
  Sparkles
} from 'lucide-react';
import AIAssistant from './AIAssistant';
import UserProfile from './UserProfile';
import Notifications from './Notifications';
import CreateProposal from './CreateProposal';

type Page = 'home' | 'map' | 'proposals' | 'discussions' | 'impact';

interface LayoutProps {
  children: ReactNode;
  currentPage: Page;
  onNavigate: (page: Page) => void;
  showCreateProposal: boolean;
  setShowCreateProposal: (show: boolean) => void;
  onAddProposal: (proposal: any) => void;
}

export default function Layout({ children, currentPage, onNavigate, showCreateProposal, setShowCreateProposal, onAddProposal }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationCount] = useState(3);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const navigation = [
    { name: 'Inicio', page: 'home' as Page, icon: Home },
    { name: 'Mapa', page: 'map' as Page, icon: Map },
    { name: 'Propuestas', page: 'proposals' as Page, icon: Vote },
    { name: 'Discusiones', page: 'discussions' as Page, icon: MessageSquare },
    { name: 'Impacto', page: 'impact' as Page, icon: TrendingUp },
  ];

  const isActive = (page: Page) => {
    return currentPage === page;
  };

  return (
    <div className="min-h-screen app-shell relative">
      <div className="app-grid-overlay pointer-events-none absolute inset-0 opacity-40" />
      {/* Header */}
      <header className="glass-header border-b border-fuchsia-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <button onClick={() => onNavigate('home')} className="flex items-center gap-2">
              <div className="w-10 h-10 brand-accent rounded-xl flex items-center justify-center shadow-md shadow-fuchsia-300/40">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-semibold text-gray-900 tracking-tight">PresupuestoCivico</span>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.page);
                return (
                  <button
                    key={item.name}
                    onClick={() => onNavigate(item.page)}
                    className={`nav-pill flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      active
                        ? 'bg-fuchsia-100 text-fuchsia-700 border border-fuchsia-200'
                        : 'text-gray-700 hover:bg-white/80'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                  </button>
                );
              })}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              <button className="hidden md:flex items-center gap-2 p-2 text-gray-700 hover:bg-white/80 rounded-lg transition-colors">
                <Search className="w-5 h-5" />
              </button>

              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowProfile(false);
                }}
                className="relative p-2 text-gray-700 hover:bg-white/80 rounded-lg transition-colors"
              >
                <Bell className="w-5 h-5" />
                {notificationCount > 0 && (
                  <span className="absolute top-1 right-1 px-1.5 min-w-[18px] h-[18px] bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {notificationCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  setShowProfile(!showProfile);
                  setShowNotifications(false);
                }}
                className="p-2 text-gray-700 hover:bg-white/80 rounded-lg transition-colors"
              >
                <User className="w-5 h-5" />
              </button>

              {/* Mobile menu button */}
              <button
                className="md:hidden p-2 text-gray-700 hover:bg-white/80 rounded-lg"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-fuchsia-100 bg-white/90 backdrop-blur-sm">
            <nav className="px-4 py-3 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.page);
                return (
                  <button
                    key={item.name}
                    onClick={() => {
                      onNavigate(item.page);
                      setMobileMenuOpen(false);
                    }}
                    className={`nav-pill w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      active
                        ? 'bg-fuchsia-100 text-fuchsia-700 border border-fuchsia-200'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="min-h-[calc(100vh-4rem)] relative z-10">
        {children}
      </main>

      {/* AI Assistant */}
      <AIAssistant />

      {/* User Profile */}
      <UserProfile isOpen={showProfile} onClose={() => setShowProfile(false)} />

      {/* Notifications */}
      <Notifications isOpen={showNotifications} onClose={() => setShowNotifications(false)} />

      {/* Create Proposal */}
      <CreateProposal isOpen={showCreateProposal} onClose={() => setShowCreateProposal(false)} onAddProposal={onAddProposal} />
    </div>
  );
}
