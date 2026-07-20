import { useFeedStore } from '@/store/feedStore';
import { Filter, SlidersHorizontal } from 'lucide-react';

const CATEGORIES = ['All', 'Electronics', 'Fashion', 'Home', 'Art', 'Collectibles', 'Vehicles'];

export default function FeedFilters() {
    const { filters, setFilter, feedType } = useFeedStore();

    return (
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 bg-white p-4 rounded-2xl border-[3px] border-[var(--ink)] shadow-[4px_4px_0_0_var(--acid)]">
            {/* Categories */}
            <div className="flex items-center gap-2 overflow-x-auto w-full pb-2 md:pb-0 scrollbar-hide">
                <Filter size={16} className="text-[var(--ink)] opacity-60 shrink-0 mr-2" />
                {CATEGORIES.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setFilter('category', cat === 'All' ? '' : cat)}
                        className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all border-[2px] ${
                            (filters.category === cat || (cat === 'All' && !filters.category))
                                ? 'bg-[var(--ink)] text-[var(--acid)] border-[var(--ink)] shadow-[2px_2px_0_0_var(--acid)] translate-y-[-2px]'
                                : 'bg-transparent text-[var(--ink)] border-transparent hover:border-[var(--ink)]'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Price Filter & Feed Type Indicator */}
            <div className="flex items-center gap-4 w-full md:w-auto shrink-0 border-t-[3px] border-[var(--ink)] md:border-t-0 md:border-l-[3px] pt-4 md:pt-0 md:pl-4">
                <div className="flex items-center gap-2">
                    <SlidersHorizontal size={16} className="opacity-60" />
                    <input 
                        type="number" 
                        placeholder="Min $" 
                        className="w-20 bg-[var(--background)] border-[2px] border-[var(--ink)] rounded-lg px-2 py-1 text-sm font-bold outline-none focus:shadow-[2px_2px_0_0_var(--hotpink)] transition-all"
                        value={filters.minPrice}
                        onChange={(e) => setFilter('minPrice', e.target.value)}
                    />
                    <span className="opacity-50 font-bold">-</span>
                    <input 
                        type="number" 
                        placeholder="Max $" 
                        className="w-20 bg-[var(--background)] border-[2px] border-[var(--ink)] rounded-lg px-2 py-1 text-sm font-bold outline-none focus:shadow-[2px_2px_0_0_var(--hotpink)] transition-all"
                        value={filters.maxPrice}
                        onChange={(e) => setFilter('maxPrice', e.target.value)}
                    />
                </div>
                
                {/* Visual indicator of what kind of feed is active */}
                <div className={`hidden lg:flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border-[2px] border-[var(--ink)] ${
                    feedType === 'trending' ? 'bg-[var(--sunset)] text-white' : 'bg-[var(--electric)] text-white'
                }`}>
                    {feedType === 'trending' ? '🔥 Trending' : '✨ For You'}
                </div>
            </div>
        </div>
    );
}
