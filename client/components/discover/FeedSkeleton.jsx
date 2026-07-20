import { motion } from 'framer-motion';

export default function FeedSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
                <div 
                    key={i} 
                    className="flex flex-col bg-white border-[3px] border-[var(--ink)] rounded-2xl overflow-hidden shadow-[4px_4px_0_0_var(--ink)] animate-pulse"
                >
                    {/* Image placeholder */}
                    <div className="w-full aspect-square bg-gray-200 border-b-[3px] border-[var(--ink)]" />
                    
                    {/* Content placeholder */}
                    <div className="p-4 flex flex-col gap-4">
                        <div className="w-3/4 h-6 bg-gray-200 rounded-lg" />
                        <div className="w-1/3 h-4 bg-gray-200 rounded-md" />
                        
                        <div className="mt-4 flex justify-between items-end">
                            <div className="w-1/2 h-8 bg-gray-200 rounded-lg" />
                            <div className="w-1/4 h-4 bg-gray-200 rounded-md" />
                        </div>
                        
                        <div className="w-full h-10 bg-gray-200 rounded-xl mt-2" />
                    </div>
                </div>
            ))}
        </div>
    );
}
