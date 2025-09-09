import React, { useState, useMemo } from 'react';
import type { CollectionAlbumInfo } from '../types';
import AlbumCard from './AlbumCard';
import SortFilterControls from './SortFilterControls';

interface CollectionPageProps {
  collection: CollectionAlbumInfo[];
  onViewAlbum: (album: CollectionAlbumInfo) => void;
}

type SortKey = 'artist' | 'album' | 'year' | 'rating';

const CollectionPage: React.FC<CollectionPageProps> = ({ collection, onViewAlbum }) => {
  const [sortKey, setSortKey] = useState<SortKey>('artist');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterGenre, setFilterGenre] = useState<string>('');
  const [filterDecade, setFilterDecade] = useState<string>('');
  const [filterStore, setFilterStore] = useState<string>('');

  const genres = useMemo(() => [...new Set(collection.map(a => a.genre).filter(Boolean))].sort(), [collection]);
  const decades = useMemo(() => [...new Set(collection.map(a => `${Math.floor(a.year / 10)}0s`).filter(Boolean))].sort(), [collection]);
  // FIX: Derive stores from the 'provenance' array, which contains purchase information.
  const stores = useMemo(() => {
    const allStores = collection.flatMap(a =>
      a.provenance
        .filter(p => p.type === 'purchase' && p.from)
        .map(p => p.from)
    );
    return [...new Set(allStores)].sort();
  }, [collection]);

  const filteredAndSortedCollection = useMemo(() => {
    let items = [...collection];

    // Filter
    if (filterGenre) {
      items = items.filter(item => item.genre === filterGenre);
    }
    if (filterDecade) {
      const startYear = parseInt(filterDecade);
      const endYear = startYear + 9;
      items = items.filter(item => item.year >= startYear && item.year <= endYear);
    }
    if (filterStore) {
        // FIX: Filter based on the 'provenance' array, checking for a purchase from the selected store.
        items = items.filter(item => item.provenance.some(p => p.type === 'purchase' && p.from === filterStore));
    }

    // Sort
    items.sort((a, b) => {
      const aVal = a[sortKey] || (sortKey === 'rating' ? 0 : '');
      const bVal = b[sortKey] || (sortKey === 'rating' ? 0 : '');
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      // Secondary sort by artist then album to keep things consistent
      if (a.artist < b.artist) return -1;
      if (a.artist > b.artist) return 1;
      if (a.album < b.album) return -1;
      if (a.album > b.album) return 1;
      return 0;
    });

    return items;
  }, [collection, sortKey, sortOrder, filterGenre, filterDecade, filterStore]);

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
        <h2 className="text-3xl font-bold text-white">My Collection ({filteredAndSortedCollection.length})</h2>
        <SortFilterControls
            sortKey={sortKey} setSortKey={setSortKey}
            sortOrder={sortOrder} setSortOrder={setSortOrder}
            filterGenre={filterGenre} setFilterGenre={setFilterGenre}
            filterDecade={filterDecade} setFilterDecade={setFilterDecade}
            filterStore={filterStore} setFilterStore={setFilterStore}
            genres={genres} decades={decades} stores={stores}
        />
      </div>
      
      {filteredAndSortedCollection.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {filteredAndSortedCollection.map((album) => (
            <AlbumCard key={`${album.artist}-${album.album}`} album={album} onClick={() => onViewAlbum(album)} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-6 bg-gray-800 rounded-lg border border-gray-700">
          <h3 className="text-xl font-semibold text-white">No matching records found.</h3>
          <p className="text-gray-400 mt-2">Try adjusting your filters or add more to your collection!</p>
        </div>
      )}
    </div>
  );
};

export default CollectionPage;