interface FourleafBrandProps {
  variant?: 'full' | 'icon' | 'compact';
  className?: string;
}

export default function FourleafBrand({ variant = 'full', className = '' }: FourleafBrandProps) {
  if (variant === 'icon') {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Fourleaf"
        >
          <circle cx="50" cy="50" r="50" fill="#000000" />
          <g transform="translate(50, 50)">
            <path
              d="M 0,-18 C -5,-18 -9,-14 -9,-9 C -9,-4 -5,0 0,0 C 0,0 -5,0 -9,-4 C -14,-9 -18,-5 -18,0 C -18,5 -14,9 -9,9 C -4,9 0,5 0,0 C 0,0 0,5 -4,9 C -9,14 -5,18 0,18 C 5,18 9,14 9,9 C 9,4 5,0 0,0 C 0,0 5,0 9,4 C 14,9 18,5 18,0 C 18,-5 14,-9 9,-9 C 4,-9 0,-5 0,0 C 0,0 0,-5 4,-9 C 9,-14 5,-18 0,-18 Z"
              fill="#22c55e"
            />
          </g>
        </svg>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2.5 ${className}`}>
        <div className="h-8 w-8 shrink-0">
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Fourleaf"
          >
            <circle cx="50" cy="50" r="50" fill="#000000" />
            <g transform="translate(50, 50)">
              <path
                d="M 0,-18 C -5,-18 -9,-14 -9,-9 C -9,-4 -5,0 0,0 C 0,0 -5,0 -9,-4 C -14,-9 -18,-5 -18,0 C -18,5 -14,9 -9,9 C -4,9 0,5 0,0 C 0,0 0,5 -4,9 C -9,14 -5,18 0,18 C 5,18 9,14 9,9 C 9,4 5,0 0,0 C 0,0 5,0 9,4 C 14,9 18,5 18,0 C 18,-5 14,-9 9,-9 C 4,-9 0,-5 0,0 C 0,0 0,-5 4,-9 C 9,-14 5,-18 0,-18 Z"
                fill="#22c55e"
              />
            </g>
          </svg>
        </div>
        <span className="font-display font-bold text-xl text-foreground">Fourleaf</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="h-12 w-12 shrink-0">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Fourleaf"
        >
          <circle cx="50" cy="50" r="50" fill="#000000" />
          <g transform="translate(50, 50)">
            <path
              d="M 0,-18 C -5,-18 -9,-14 -9,-9 C -9,-4 -5,0 0,0 C 0,0 -5,0 -9,-4 C -14,-9 -18,-5 -18,0 C -18,5 -14,9 -9,9 C -4,9 0,5 0,0 C 0,0 0,5 -4,9 C -9,14 -5,18 0,18 C 5,18 9,14 9,9 C 9,4 5,0 0,0 C 0,0 5,0 9,4 C 14,9 18,5 18,0 C 18,-5 14,-9 9,-9 C 4,-9 0,-5 0,0 C 0,0 0,-5 4,-9 C 9,-14 5,-18 0,-18 Z"
              fill="#22c55e"
            />
          </g>
        </svg>
      </div>
      <span className="font-display font-bold text-2xl text-foreground">Fourleaf</span>
    </div>
  );
}
