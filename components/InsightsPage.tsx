import React, { useMemo } from 'react';
import type { CollectionAlbumInfo } from '../types';
import BarChart from './BarChart';

interface InsightsPageProps {
  collection: CollectionAlbumInfo[];
}

const InsightsPage: React.FC<InsightsPageProps> = ({ collection }) => {

  const topGenres = useMemo(() => {
    const genreCounts = collection.reduce((acc, album) => {
      if (album.genre) {
        acc[album.genre] = (acc[album.genre] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(genreCounts)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [collection]);

  const topArtists = useMemo(() => {
    const artistCounts = collection.reduce((acc, album) => {
      acc[album.artist] = (acc[album.artist] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(artistCounts)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [collection]);
  
  const monthlySpending = useMemo(() => {
    const spending = collection.reduce((acc, album) => {
        const purchase = album.provenance.find(p => p.type === 'purchase' && p.price);
        if (purchase) {
            const month = purchase.date.substring(0, 7); // YYYY-MM
            acc[month] = (acc[month] || 0) + (purchase.price || 0);
        }
        return acc;
    }, {} as Record<string, number>);
     return Object.entries(spending)
      .map(([label, value]) => ({ label, value: Math.round(value) }))
      .sort((a, b) => a.label.localeCompare(b.label))
      .slice(-12); // Last 12 months
  }, [collection]);

  return (
    <div className="animate-fade-in space-y-8">
      <h2 className="text-3xl font-bold text-white mb-6">Collection Insights</h2>
      
      {collection.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <BarChart title="Top 5 Genres" data={topGenres} />
            <BarChart title="Top 5 Artists" data={topArtists} />
            <div className="lg:col-span-2">
                <BarChart title="Monthly Spending (Last 12 Months)" data={monthlySpending} formatAsCurrency />
            </div>
        </div>
      ) : (
         <div className="text-center py-16 px-6 bg-gray-800 rounded-lg border border-gray-700">
          <h3 className="text-xl font-semibold text-white">No insights yet.</h3>
          <p className="text-gray-400 mt-2">Add albums to your collection to see your stats here!</p>
        </div>
      )}
    </div>
  );
};

export default InsightsPage;
