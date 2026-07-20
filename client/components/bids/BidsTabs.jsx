import { useBidsStore } from '@/store/bidsStore';

const TABS = [
    { id: 'active', label: 'Active Bids', icon: '⚡' },
    { id: 'won', label: 'Items Won', icon: '🏆' },
    { id: 'lost', label: 'Lost / Outbid', icon: '❌' },
    { id: 'all', label: 'All History', icon: '📚' },
];

export default function BidsTabs() {
    const { activeTab, setTab } = useBidsStore();

    return (
        <div className="relative z-20 flex items-center gap-4 overflow-x-auto pb-4 mb-4 scrollbar-hide border-b-[3px] border-black/10 pr-4">
            {TABS.map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setTab(tab.id)}
                    className={`flex items-center gap-2 whitespace-nowrap px-6 py-3 rounded-t-xl text-xs font-black uppercase tracking-widest transition-all border-[3px] border-b-0 ${
                        activeTab === tab.id
                            ? 'bg-white text-[var(--ink)] border-[var(--ink)] translate-y-[3px] z-10 shadow-[4px_0_0_0_rgba(0,0,0,0.1)]'
                            : 'bg-transparent text-[var(--ink)]/50 border-transparent hover:bg-black/5 hover:text-[var(--ink)]'
                    }`}
                >
                    <span className="text-base">{tab.icon}</span>
                    {tab.label}
                </button>
            ))}
        </div>
    );
}
