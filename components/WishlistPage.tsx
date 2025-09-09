import React from 'react';
import type { AlbumInfo } from '../types';
import { RecordIcon } from './icons/RecordIcon';
import { TradeIcon } from './icons/TradeIcon';

interface WishlistPageProps {
  wishlist: AlbumInfo[];
  onUpdatePriority: (albumId: string, priority: 'High' | 'Medium' | 'Low') => void;
  matchedAlbumIds: Set<string>;
  onGoToTradeMatches: () => void;
}

const getAlbumId = (album: AlbumInfo) => `${album.artist}-${album.album}`;

const priorityClasses = {
    High: 'bg-red-500/20 text-red-300',
    Medium: 'bg-yellow-500/20 text-yellow-300',
    Low: 'bg-blue-500/20 text-blue-300',
};

const WishlistCard: React.FC<{ album: AlbumInfo; onUpdatePriority: WishlistPageProps['onUpdatePriority']; isMatch: boolean; onGoToTradeMatches: () => void; }> = ({ album, onUpdatePriority, isMatch, onGoToTradeMatches }) => {
    const albumId = getAlbumId(album);
    const priority = album.priority || 'Medium';

    return (
        <div>
            <div className="aspect-square bg-gray-800 rounded-lg overflow-hidden relative shadow-lg shadow-black/30">
                {album.coverArtUrl ? (
                    <img src={album.coverArtUrl} alt={`${album.album} by ${album.artist}`} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-700">
                        <RecordIcon className="w-1/3 h-1/3 text-gray-500" />
                    </div>
                )}
                 <div className={`absolute top-2 right-2 text-xs font-bold px-2 py-1 rounded-full ${priorityClasses[priority]}`}>
                    {priority}
                </div>
                {isMatch && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onGoToTradeMatches();
                        }}
                        className="absolute bottom-0 left-0 right-0 w-full bg-black/70 p-2 backdrop-blur-sm text-center text-teal-300 text-xs font-semibold flex items-center justify-center gap-1 hover:bg-black/90 hover:text-teal-200 transition-colors"
                    >
                        <TradeIcon className="w-4 h-4" />
                        <span>Available for Trade</span>
                    </button>
                )}
            </div>
            <div className="mt-3 text-white">
                <h3 className="font-bold truncate">{album.album}</h3>
                <p className="text-sm text-gray-400 truncate">{album.artist}</p>
                 <select 
                    value={priority} 
                    onChange={(e) => onUpdatePriority(albumId, e.target.value as 'High' | 'Medium' | 'Low')}
                    onClick={(e) => e.stopPropagation()} // Prevent card click-through if it becomes interactive
                    className="mt-2 w-full bg-gray-700 text-sm text-white rounded-md px-2 py-1 border border-gray-600 focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="Low">Low Priority</option>
                </select>
            </div>
        </div>
    );
};

const WishlistPage: React.FC<WishlistPageProps> = ({ wishlist, onUpdatePriority, matchedAlbumIds, onGoToTradeMatches }) => {
  return (
    <div className="animate-fade-in">
      <h2 className="text-3xl font-bold text-white mb-6">My Wishlist ({wishlist.length})</h2>
      {wishlist.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {wishlist.map((album) => (
            <WishlistCard 
                key={getAlbumId(album)} 
                album={album} 
                onUpdatePriority={onUpdatePriority} 
                isMatch={matchedAlbumIds.has(getAlbumId(album))}
                onGoToTradeMatches={onGoToTradeMatches}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-6 bg-gray-800 rounded-lg border border-gray-700">
          <h3 className="text-xl font-semibold text-white">Your wishlist is empty.</h3>
          <p className="text-gray-400 mt-2">Find something you want? Use the scanner to add it here.</p>
        </div>
      )}
    </div>
  );
};

export default WishlistPage;