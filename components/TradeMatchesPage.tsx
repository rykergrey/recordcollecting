import React from 'react';
import type { AlbumInfo, User } from '../types';
import { TradeIcon } from './icons/TradeIcon';

interface TradeMatchesPageProps {
  // FIX: Expect the full User object to ensure all necessary properties are available.
  matches: { album: AlbumInfo, user: User }[];
  onInitiateTrade: (album: AlbumInfo, user: User) => void;
}

const TradeMatchCard: React.FC<{ match: TradeMatchesPageProps['matches'][0], onInitiateTrade: TradeMatchesPageProps['onInitiateTrade'] }> = ({ match, onInitiateTrade }) => {
    return (
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <div className="flex flex-col sm:flex-row gap-4">
                <img src={match.album.coverArtUrl} alt={match.album.album} className="w-24 h-24 rounded-md object-cover self-center sm:self-start"/>
                <div className="flex-1 flex flex-col justify-between">
                    <div>
                        <p className="text-gray-400">You want:</p>
                        <h3 className="font-bold text-lg text-white">{match.album.album}</h3>
                        <p className="text-gray-300">{match.album.artist}</p>
                    </div>
                     <div className="flex items-center gap-3 mt-2">
                        <img src={match.user.avatarUrl} alt={match.user.name} className="w-8 h-8 rounded-full" />
                        <p className="text-sm">
                            <span className="text-gray-400">Available from: </span>
                            <span className="font-semibold text-white">{match.user.name}</span>
                        </p>
                    </div>
                </div>
                <div className="self-center">
                    <button 
                        onClick={() => onInitiateTrade(match.album, match.user)}
                        className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded-lg transition"
                    >
                        <TradeIcon className="w-5 h-5"/>
                        Propose Trade
                    </button>
                </div>
            </div>
        </div>
    );
};

const TradeMatchesPage: React.FC<TradeMatchesPageProps> = ({ matches, onInitiateTrade }) => {
  return (
    <div className="animate-fade-in">
      {matches.length > 0 ? (
        <div className="space-y-4">
            {matches.map(match => (
                <TradeMatchCard key={`${match.album.artist}-${match.album.album}-${match.user.id}`} match={match} onInitiateTrade={onInitiateTrade}/>
            ))}
        </div>
      ) : (
        <div className="text-center py-16 px-6 bg-gray-800 rounded-lg border border-gray-700">
          <h3 className="text-xl font-semibold text-white">No trade matches found.</h3>
          <p className="text-gray-400 mt-2">Add more albums to your wishlist! We'll notify you if they appear on someone's trade list.</p>
        </div>
      )}
    </div>
  );
};

export default TradeMatchesPage;