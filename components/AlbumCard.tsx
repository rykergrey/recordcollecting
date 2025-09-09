import React from 'react';
import type { CollectionAlbumInfo } from '../types';
import { RecordIcon } from './icons/RecordIcon';
import StarRating from './StarRating';

interface AlbumCardProps {
  album: CollectionAlbumInfo;
  onClick: () => void;
}

const AlbumCard: React.FC<AlbumCardProps> = ({ album, onClick }) => {
  return (
    <button onClick={onClick} className="group text-left">
      <div className="aspect-square bg-gray-800 rounded-lg overflow-hidden relative shadow-lg shadow-black/30 transition-transform duration-300 group-hover:scale-105">
        {album.coverArtUrls && album.coverArtUrls.length > 0 ? (
          <img src={album.coverArtUrls[0]} alt={`${album.album} by ${album.artist}`} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-700">
            <RecordIcon className="w-1/3 h-1/3 text-gray-500" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <div className="mt-3 text-white">
        <h3 className="font-bold truncate">{album.album}</h3>
        <p className="text-sm text-gray-400 truncate">{album.artist}</p>
        {album.rating !== undefined && (
          <div className="mt-1">
            <StarRating rating={album.rating} isDisplayOnly={true} />
          </div>
        )}
      </div>
    </button>
  );
};

export default AlbumCard;
