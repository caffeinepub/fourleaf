import { useHomeBrowsing, type HomeTab } from '../../hooks/useHomeBrowsing';

export default function HomeTabBar() {
  const { activeTab, setActiveTab } = useHomeBrowsing();

  const tabs: HomeTab[] = ['All', 'Music', 'Podcast'];

  return (
    <div className="flex items-center gap-2 py-3 bg-background/50">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`px-5 py-2 text-sm font-medium rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
            activeTab === tab
              ? 'bg-primary text-primary-foreground shadow-md'
              : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
