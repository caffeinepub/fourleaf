import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StreamingSectionProps {
  title: string;
  icon?: React.ReactNode;
  onShowAll?: () => void;
  children: React.ReactNode;
}

export default function StreamingSection({ title, icon, onShowAll, children }: StreamingSectionProps) {
  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          {icon && <div className="text-primary">{icon}</div>}
          <h2 className="text-2xl md:text-3xl font-display font-bold">{title}</h2>
        </div>
        {onShowAll && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onShowAll}
            className="text-muted-foreground hover:text-foreground gap-1 group"
          >
            Show all
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Button>
        )}
      </div>
      {children}
    </section>
  );
}
