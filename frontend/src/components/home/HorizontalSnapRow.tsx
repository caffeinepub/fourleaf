import { useRef } from 'react';

interface HorizontalSnapRowProps {
  children: React.ReactNode;
  className?: string;
}

export default function HorizontalSnapRow({ children, className = '' }: HorizontalSnapRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={scrollRef}
      className={`flex gap-4 overflow-x-auto overflow-y-hidden scroll-smooth snap-x snap-mandatory no-scrollbar pb-2 ${className}`}
    >
      {children}
    </div>
  );
}
