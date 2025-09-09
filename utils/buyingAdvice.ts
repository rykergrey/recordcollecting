import React from 'react';
import type { AlbumAnalysisResult, AlbumInfo } from '../types';
import { ThumbsUpIcon } from '../components/icons/ThumbsUpIcon';
import { ThumbsDownIcon } from '../components/icons/ThumbsDownIcon';
import { ThinkIcon } from '../components/icons/ThinkIcon';
import { StarIcon } from '../components/icons/StarIcon';

export enum AdviceLevel {
  SKIP = 'SKIP',
  CONSIDER = 'CONSIDER',
  BUY = 'BUY',
  MUST_BUY = 'MUST_BUY',
}

// FIX: Replace JSX syntax with React.createElement in this .ts file to avoid compilation errors.
export const recommendationMeta = {
  [AdviceLevel.SKIP]: {
    label: 'Skip It',
    color: 'bg-red-500/10 border-red-500 text-red-400',
    icon: React.createElement(ThumbsDownIcon, { className: 'w-5 h-5' }),
  },
  [AdviceLevel.CONSIDER]: {
    label: 'Consider',
    color: 'bg-yellow-500/10 border-yellow-500 text-yellow-400',
    icon: React.createElement(ThinkIcon, { className: 'w-5 h-5' }),
  },
  [AdviceLevel.BUY]: {
    label: 'Good Pick',
    color: 'bg-green-500/10 border-green-500 text-green-400',
    icon: React.createElement(ThumbsUpIcon, { className: 'w-5 h-5' }),
  },
  [AdviceLevel.MUST_BUY]: {
    label: 'Must Buy!',
    color: 'bg-teal-500/10 border-teal-500 text-teal-400',
    icon: React.createElement(StarIcon, { className: 'w-5 h-5' }),
  },
};

export const getBuyingAdvice = (
    albumInfo: Partial<AlbumAnalysisResult>,
    collection: AlbumInfo[],
    wishlist: AlbumInfo[]
): { level: AdviceLevel; rationale: string } | null => {
    if (!albumInfo.album || !albumInfo.artist || !albumInfo.genre) {
        return null; // Not enough info for a recommendation yet
    }
    
    const isInWishlist = wishlist.some(item => item.album === albumInfo.album && item.artist === albumInfo.artist);
    const wishlistPriority = wishlist.find(item => item.album === albumInfo.album && item.artist === albumInfo.artist)?.priority;

    if (isInWishlist) {
        if (wishlistPriority === 'High') {
            return {
                level: AdviceLevel.MUST_BUY,
                rationale: "This is a high-priority item on your wishlist. Don't hesitate!"
            };
        }
        return {
            level: AdviceLevel.BUY,
            rationale: "This album is on your wishlist, making it a solid choice for your collection."
        };
    }
    
    // A simple heuristic for genre similarity
    const collectionGenres = new Set(collection.map(i => (i as any).genre).filter(Boolean));
    const isSimilarGenre = collectionGenres.has(albumInfo.genre);

    if (isSimilarGenre) {
        return {
            level: AdviceLevel.BUY,
            rationale: `This fits well with other ${albumInfo.genre} albums in your collection.`
        };
    }

    return {
        level: AdviceLevel.CONSIDER,
        rationale: "A chance to explore a new sound! This could be a great way to diversify your collection."
    };
};
