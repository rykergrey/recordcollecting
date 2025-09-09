import React from 'react';
import type { TrackInfo } from '../types';
import StarRating from './StarRating';
import { YouTubeIcon } from './icons/YouTubeIcon';

interface TracklistItemProps {
  trackNumber: number;
  track: TrackInfo;
  onRatingChange: (rating: number) => void;
}

const TracklistItem: React.FC<TracklistItemProps> = ({ trackNumber, track, onRatingChange }) => {
  return (
    <div className="p-4 rounded-lg bg-gray-900/50 border border-gray-700/50">
      <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
        <div className="flex-1">
          <div className="flex items-baseline gap-3">
            <span className="text-sm font-mono text-gray-500">{trackNumber.toString().padStart(2, '0')}</span>
            <h4 className="font-bold text-lg text-white">{track.title}</h4>
          </div>
          <p className="text-gray-400 mt-1 pl-7 text-sm">{track.description}</p>
        </div>
        <div className="flex-shrink-0 flex sm:flex-col items-end gap-4 pl-7 sm:pl-0">
            <StarRating rating={track.rating || 0} onRatingChange={onRatingChange} />
             <a 
                href={track.youtubeMusicUrl}
                target="_blank"
                rel="noopener noreferrer"
                title={`Search for ${track.title} on YouTube Music`}
                className="text-gray-400 hover:text-white transition"
            >
                <YouTubeIcon className="w-6 h-6"/>
            </a>
        </div>
      </div>
    </div>
  );
};

export default TracklistItem;
