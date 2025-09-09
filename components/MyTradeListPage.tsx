import React from 'react';
import type { CollectionAlbumInfo } from '../types';
import { RecordIcon } from './icons/RecordIcon';

interface MyTradeListPageProps {
  tradeList: CollectionAlbumInfo[];
}

const TradeListCard: React.FC<{ album: CollectionAlbumInfo }> = ({ album }) => {
    return (
        <div>
            <div className="aspect-square bg-gray-800 rounded-lg overflow-hidden relative shadow-lg shadow-black/30">
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

const MyTradeListPage: React.FC<MyTradeListPageProps> = ({ tradeList }) => {
  return (
    <div className="animate-fade-in">
      {tradeList.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {tradeList.map((album) => (
            <TradeListCard key={`${album.artist}-${album.album}`} album={album} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-6 bg-gray-800 rounded-lg border border-gray-700">
          <h3 className="text-xl font-semibold text-white">Your trade list is empty.</h3>
          <p className="text-gray-400 mt-2">You can move items from your collection here to offer them for trade.</p>
        </div>
      )}
    </div>
  );
};

export default MyTradeListPage;
