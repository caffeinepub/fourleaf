import { useNavigate } from '@tanstack/react-router';
import { Music, Library, Sparkles, Shield, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsCallerAdmin } from '../../hooks/useQueries';

export default function LeftSidebar() {
  const navigate = useNavigate();
  const { data: isAdmin } = useIsCallerAdmin();

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Library, label: 'My Library', path: '/my-library' },
    { icon: Sparkles, label: 'Pricing', path: '/pricing' },
  ];

  return (
    <aside className="w-64 shrink-0 hidden lg:flex flex-col gap-2 p-2">
      {/* Navigation Section */}
      <div className="bg-card/80 backdrop-blur rounded-xl p-3 border border-border/50">
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <Button
              key={item.path}
              variant="ghost"
              className="w-full justify-start gap-3 text-base font-medium hover:bg-accent/50"
              onClick={() => navigate({ to: item.path })}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Button>
          ))}
        </nav>
      </div>

      {/* Library/Admin Section */}
      <div className="bg-card/80 backdrop-blur rounded-xl p-3 border border-border/50 flex-1">
        <div className="flex items-center gap-2 mb-3 px-3">
          <Music className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold text-sm">Your Library</h3>
        </div>
        <div className="flex flex-col gap-1">
          {isAdmin && (
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-base font-medium hover:bg-accent/50"
              onClick={() => navigate({ to: '/admin' })}
            >
              <Shield className="h-5 w-5" />
              Admin
            </Button>
          )}
        </div>
      </div>
    </aside>
  );
}
