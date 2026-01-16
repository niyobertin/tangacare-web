import React, { useState, useEffect } from 'react';
import { healthTipService } from '@/services/health-tip.service';
import type { HealthTip } from '@/types/health';
import { format } from 'date-fns';
import { Heart, Share2, Bookmark } from 'lucide-react';

const HealthTipsPage = () => {
    const [tips, setTips] = useState<HealthTip[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [category, setCategory] = useState<string>('all');

    useEffect(() => {
        loadTips();
    }, [category]);

    const loadTips = async () => {
        setIsLoading(true);
        try {
            const params = category !== 'all' ? { category } : {};
            const data = await healthTipService.getAll(params);
            setTips(data);
        } catch (error) {
            console.error('Failed to load health tips', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Health Tips & Advice</h1>
            </div>

            <div className="flex gap-2 pb-2 overflow-x-auto">
                {['all', 'nutrition', 'fitness', 'mental_health', 'general'].map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${category === cat ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        {cat.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </button>
                ))}
            </div>

            {isLoading ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse"></div>
                    ))}
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {tips.map((tip) => (
                        <div key={tip.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition group">
                            <div className="h-48 bg-gray-100 relative overflow-hidden">
                                {/* Placeholder for image if we had one */}
                                <div className="absolute inset-0 bg-blue-50 flex items-center justify-center text-blue-200">
                                    <Heart size={48} />
                                </div>
                                <span className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur rounded-full text-xs font-semibold text-blue-600 capitalize">
                                    {tip.category}
                                </span>
                            </div>
                            <div className="p-6">
                                <h3 className="font-bold text-xl text-gray-900 mb-2 group-hover:text-blue-600 transition">
                                    {tip.title}
                                </h3>
                                <p className="text-gray-600 line-clamp-3 mb-4">
                                    {tip.content}
                                </p>
                                <div className="flex justify-between items-center text-sm text-gray-500 pt-4 border-t border-gray-100">
                                    <span>{format(new Date(tip.created_at), 'MMM d, yyyy')}</span>
                                    <div className="flex gap-3">
                                        <button className="hover:text-blue-600"><Bookmark size={18} /></button>
                                        <button className="hover:text-blue-600"><Share2 size={18} /></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {tips.length === 0 && (
                        <div className="col-span-full text-center py-12 text-gray-500">
                            No health tips found for this category.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default HealthTipsPage;
