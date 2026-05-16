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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <button onClick={() => onNavigate('home')} className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-fuchsia-600 rounded-xl flex items-center justify-center">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-semibold text-gray-900">PresupuestoCívico</span>
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
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      active
                        ? 'bg-purple-50 text-purple-600'
                        : 'text-gray-700 hover:bg-gray-100'
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
              <button className="hidden md:flex items-center gap-2 p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <Search className="w-5 h-5" />
              </button>

              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowProfile(false);
                }}
                className="relative p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
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
                className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <User className="w-5 h-5" />
              </button>

              {/* Mobile menu button */}
              <button
                className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
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
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      active
                        ? 'bg-purple-50 text-purple-600'
                        : 'text-gray-700 hover:bg-gray-100'
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
      <main className="min-h-[calc(100vh-4rem)]">
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
