import React from 'react';
import type { CollectionAlbumInfo } from '../types';
import { RecordIcon } from './icons/RecordIcon';

interface ForSalePageProps {
  forSaleList: CollectionAlbumInfo[];
}

// A simplified card for the For Sale page, as it doesn't need to be interactive
const ForSaleCard: React.FC<{ album: CollectionAlbumInfo }> = ({ album }) => {
    return (
        <div>
            <div className="aspect-square bg-gray-800 rounded-lg overflow-hidden relative shadow-lg shadow-black/30">
                {/* FIX: Use `coverArtUrls` array instead of non-existent `coverArtUrl` property. */}
                {album.coverArtUrls && album.coverArtUrls.length > 0 ? (
                <img src={album.coverArtUrls[0]} alt={`${album.album} by ${album.artist}`} className="w-full h-full object-cover" />
                ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-700">
                    <RecordIcon className="w-1/3 h-1/3 text-gray-500" />
                </div>
                )}
            </div>
            <div className="mt-3 text-white">
                <h3 className="font-bold truncate">{album.album}</h3>
                <p className="text-sm text-gray-400 truncate">{album.artist}</p>
            </div>
        </div>
    );
};

const ForSalePage: React.FC<ForSalePageProps> = ({ forSaleList }) => {
  return (
    <div className="animate-fade-in">
      <h2 className="text-3xl font-bold text-white mb-6">For Sale / Trade ({forSaleList.length})</h2>
      {forSaleList.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {forSaleList.map((album) => (
            <ForSaleCard key={`${album.artist}-${album.album}`} album={album} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-6 bg-gray-800 rounded-lg border border-gray-700">
          <h3 className="text-xl font-semibold text-white">Your "For Sale" list is empty.</h3>
          <p className="text-gray-400 mt-2">You can move items from your collection here.</p>
        </div>
      )}
    </div>
  );
};

export default ForSalePage;