import React, { useState, useMemo } from 'react';
// FIX: Changed 'import type' to a regular 'import' for 'ActivityType' because it is an enum used as a value.
import { type ActivityEvent, ActivityType, type User } from '../types';
import { RecordIcon } from './icons/RecordIcon';
import StarRating from './StarRating';
import { TradeIcon } from './icons/TradeIcon';
import { UserFollowIcon } from './icons/UserFollowIcon';
import { UserFollowingIcon } from './icons/UserFollowingIcon';

interface CommunityPageProps {
  activityFeed: ActivityEvent[];
  allUsers: User[];
  followedUsers: Set<string>;
  onToggleFollow: (userId: string) => void;
  onViewProfile: (userId: string) => void;
}

const ActivityCard: React.FC<{ activity: ActivityEvent, isFollowing: boolean, onToggleFollow: (userId: string) => void, onViewProfile: (userId: string) => void }> = ({ activity, isFollowing, onToggleFollow, onViewProfile }) => {
    
    const activityText = {
        [ActivityType.NEW_ALBUM]: 'added a new album to their collection:',
        [ActivityType.NEW_WISHLIST]: 'added a new album to their wishlist:',
        [ActivityType.NEW_TRADELIST]: 'added an album to their trade list:',
        [ActivityType.NEW_RATING]: 'left a rating for:',
        [ActivityType.NEW_COMMENT]: 'commented on:',
        [ActivityType.NEW_REVIEW]: 'wrote a review for:',
    };

    return (
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 flex flex-col sm:flex-row gap-4">
            <button onClick={() => onViewProfile(activity.user.id)} className="flex-shrink-0 self-center sm:self-start" title={`View ${activity.user.name}'s profile`}>
                <img src={activity.user.avatarUrl} alt={activity.user.name} className="w-12 h-12 rounded-full" />
            </button>
            <div className="flex-grow">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-gray-300">
                            <button onClick={() => onViewProfile(activity.user.id)} className="font-bold text-white hover:underline">{activity.user.name}</button>
                            {' '}{activityText[activity.type] || 'did something with:'}
                        </p>
                        <p className="text-xs text-gray-500">{new Date(activity.timestamp).toLocaleString()}</p>
                    </div>
                    <button 
                      onClick={() => onToggleFollow(activity.user.id)}
                      className={`inline-flex items-center gap-2 text-sm font-semibold py-1 px-3 rounded-full transition ${isFollowing ? 'bg-teal-500/20 text-teal-300' : 'bg-gray-600 hover:bg-gray-500 text-white'}`}
                      >
                      {isFollowing ? <UserFollowingIcon className="w-4 h-4" /> : <UserFollowIcon className="w-4 h-4" />}
                      {isFollowing ? 'Following' : 'Follow'}
                    </button>
                </div>
                
                {activity.details?.rating && activity.type === ActivityType.NEW_RATING && (
                    <div className="my-2 flex items-center gap-2">
                        <StarRating rating={activity.details.rating} isDisplayOnly={true} />
                        <span className="font-semibold text-amber-400">{activity.details.rating}/5</span>
                    </div>
                )}
                
                {activity.details?.review && (
                    <blockquote className="my-2 p-3 bg-gray-900/50 rounded-lg border border-gray-700/50 text-gray-300">
                       <p className="italic">"{activity.details.review}"</p>
                    </blockquote>
                )}

                {activity.details?.comment && (
                    <blockquote className="my-2 p-3 bg-gray-900/50 rounded-lg border border-gray-700/50 italic text-gray-300">
                        "{activity.details.comment}"
                    </blockquote>
                )}
                
                <div className="mt-3 flex gap-4 bg-gray-900/50 p-3 rounded-md">
                    <img src={activity.album.coverArtUrl} alt={activity.album.album} className="w-20 h-20 rounded-md object-cover" />
                    <div>
                        <p className="font-bold text-white">{activity.album.album}</p>
                        <p className="text-gray-400">{activity.album.artist}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};


const CommunityPage: React.FC<CommunityPageProps> = ({ activityFeed, followedUsers, onToggleFollow, onViewProfile }) => {
  const [filter, setFilter] = useState<'all' | 'following'>('all');

  const filteredFeed = useMemo(() => {
    if (filter === 'following') {
      return activityFeed.filter(activity => followedUsers.has(activity.user.id));
    }
    return activityFeed;
  }, [activityFeed, followedUsers, filter]);

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
        <h2 className="text-3xl font-bold text-white">Community Feed</h2>
        <div className="flex items-center gap-2 p-1 bg-gray-800 rounded-lg border border-gray-700">
            <button onClick={() => setFilter('all')} className={`px-4 py-1 text-sm font-semibold rounded-md transition ${filter === 'all' ? 'bg-teal-500 text-white' : 'text-gray-400 hover:bg-gray-700'}`}>All</button>
            <button onClick={() => setFilter('following')} className={`px-4 py-1 text-sm font-semibold rounded-md transition ${filter === 'following' ? 'bg-teal-500 text-white' : 'text-gray-400 hover:bg-gray-700'}`}>Following</button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredFeed.length > 0 ? (
            filteredFeed.map(activity => (
                <ActivityCard 
                    key={activity.id} 
                    activity={activity} 
                    isFollowing={followedUsers.has(activity.user.id)}
                    onToggleFollow={onToggleFollow}
                    onViewProfile={onViewProfile}
                />
            ))
        ) : (
            <div className="text-center py-16 px-6 bg-gray-800 rounded-lg border border-gray-700">
                <h3 className="text-xl font-semibold text-white">The feed is quiet...</h3>
                <p className="text-gray-400 mt-2">
                    {filter === 'following' ? "You're not following anyone yet, or they haven't been active. Switch to 'All' to discover new collectors!" : "No community activity to show right now."}
                </p>
            </div>
        )}
      </div>
    </div>
  );
};

export default CommunityPage;