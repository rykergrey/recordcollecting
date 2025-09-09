
import React, { useState, useMemo } from 'react';
import type { User, ActivityEvent, CollectionAlbumInfo, AlbumInfo } from '../types';
import AlbumCard from './AlbumCard';
import StarRating from './StarRating';
import { UserFollowIcon } from './icons/UserFollowIcon';
import { UserFollowingIcon } from './icons/UserFollowingIcon';
import { TradeIcon } from './icons/TradeIcon';
import { RecordIcon } from './icons/RecordIcon';
import { StarIcon } from './icons/StarIcon';
import { CommunityIcon } from './icons/CommunityIcon';
import { ActivityType } from '../types';
import { ShareIcon } from './icons/ShareIcon';
import { CheckIcon } from './icons/CheckIcon';
import { CloseIcon } from './icons/CloseIcon';

interface UserProfilePageProps {
    user: User;
    currentUser: User;
    isFollowing: boolean;
    activityFeed: ActivityEvent[];
    onBack: () => void;
    onToggleFollow: (userId: string) => void;
    onInitiateTrade: (wantedAlbum: CollectionAlbumInfo, toUser: User) => void;
    onViewAlbum: (album: AlbumInfo) => void;
    onSendShareRequest: (userId: string) => void;
    onAcceptShareRequest: (userId: string) => void;
    onRejectShareRequest: (userId: string) => void;
}

const Section: React.FC<{ title: string, children: React.ReactNode, count?: number, icon: React.ReactElement }> = ({ title, children, count, icon }) => (
    <div className="mt-8">
        <h2 className="text-2xl font-bold text-teal-300 mb-4 pb-2 border-b-2 border-gray-700 flex items-center gap-3">
            {icon}
            {title} {count !== undefined && `(${count})`}
        </h2>
        {children}
    </div>
);

const UserProfilePage: React.FC<UserProfilePageProps> = (props) => {
    const { 
        user, currentUser, isFollowing, activityFeed, onBack, onToggleFollow, onInitiateTrade, 
        onViewAlbum, onSendShareRequest, onAcceptShareRequest, onRejectShareRequest 
    } = props;
    const [isCollectionExpanded, setIsCollectionExpanded] = useState(false);
    
    const isCurrentUserProfile = user.id === currentUser.id;

    const publicCollection = useMemo(() => {
        return [...user.collection, ...user.tradeList]
            .filter(a => a.isPublic)
            .sort((a, b) => new Date(b.provenance[0].date).getTime() - new Date(a.provenance[0].date).getTime());
    }, [user.collection, user.tradeList]);

    const displayedCollection = isCollectionExpanded ? publicCollection : publicCollection.slice(0, 8);
    
    const userActivity = useMemo(() => {
        return activityFeed.filter(a => a.user.id === user.id).slice(0, 5);
    }, [activityFeed, user.id]);

    const activityTextMap: { [key in ActivityType]?: string } = {
        [ActivityType.NEW_ALBUM]: `added a new album to their collection:`,
        [ActivityType.NEW_WISHLIST]: `added to their wishlist:`,
        [ActivityType.NEW_TRADELIST]: `listed for trade:`,
        [ActivityType.NEW_RATING]: `rated`,
        [ActivityType.NEW_COMMENT]: `commented on`,
        [ActivityType.NEW_REVIEW]: `reviewed`,
    };

    const renderShareButton = () => {
        if (isCurrentUserProfile) return null;

        const isMutualFollow = isFollowing && user.followedUserIds.includes(currentUser.id);
        const isSharing = currentUser.sharedLibraryWith?.includes(user.id);
        const requestStatus = currentUser.libraryShareRequests?.[user.id];

        if (isSharing) {
            return (
                <div className="inline-flex items-center gap-2 text-sm font-semibold py-2 px-4 rounded-full bg-green-500/20 text-green-300">
                    <CheckIcon className="w-5 h-5" />
                    Libraries Shared
                </div>
            );
        }

        if (isMutualFollow) {
            if (requestStatus === 'sent') {
                return (
                    <button disabled className="inline-flex items-center gap-2 text-sm font-semibold py-2 px-4 rounded-full bg-gray-600 text-white cursor-not-allowed">
                        <ShareIcon className="w-5 h-5" />
                        Request Sent
                    </button>
                );
            }
            if (requestStatus === 'received') {
                return (
                    <div className="flex flex-col sm:flex-row gap-2">
                        <span className="text-sm text-gray-300 self-center">Share request received:</span>
                        <div className="flex gap-2">
                            <button onClick={() => onAcceptShareRequest(user.id)} className="inline-flex items-center gap-1 text-sm font-bold py-2 px-3 rounded-full bg-green-600 hover:bg-green-500 text-white">
                                <CheckIcon className="w-4 h-4" /> Accept
                            </button>
                             <button onClick={() => onRejectShareRequest(user.id)} className="inline-flex items-center gap-1 text-sm font-bold py-2 px-3 rounded-full bg-red-600 hover:bg-red-500 text-white">
                                <CloseIcon className="w-4 h-4" /> Decline
                            </button>
                        </div>
                    </div>
                );
            }
            return (
                <button onClick={() => onSendShareRequest(user.id)} className="inline-flex items-center gap-2 text-sm font-semibold py-2 px-4 rounded-full bg-teal-600 hover:bg-teal-500 text-white transition">
                    <ShareIcon className="w-5 h-5" />
                    Share Library
                </button>
            );
        }
        return null;
    }


    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            <button onClick={onBack} className="mb-6 text-teal-400 hover:text-teal-300 font-semibold">
                &larr; Back
            </button>

            <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-2xl shadow-black/20 p-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-center gap-6">
                    <img src={user.avatarUrl} alt={user.name} className="w-24 h-24 rounded-full border-4 border-gray-600" />
                    <div className="flex-1 text-center sm:text-left">
                        <h1 className="text-4xl font-bold text-white">{user.name}</h1>
                    </div>
                    {!isCurrentUserProfile && (
                        <div className="flex flex-col items-center gap-3">
                            <button 
                                onClick={() => onToggleFollow(user.id)}
                                className={`inline-flex items-center gap-2 text-sm font-semibold py-2 px-4 rounded-full transition ${isFollowing ? 'bg-teal-500/20 text-teal-300' : 'bg-gray-600 hover:bg-gray-500 text-white'}`}
                            >
                                {isFollowing ? <UserFollowingIcon className="w-5 h-5" /> : <UserFollowIcon className="w-5 h-5" />}
                                {isFollowing ? 'Following' : 'Follow'}
                            </button>
                            {renderShareButton()}
                        </div>
                    )}
                </div>

                {/* Collection */}
                <Section title="Collection" count={publicCollection.length} icon={<RecordIcon className="w-6 h-6"/>}>
                    {publicCollection.length > 0 ? (
                        <>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                                {displayedCollection.map(album => (
                                    <AlbumCard key={`${album.artist}-${album.album}`} album={album} currentUser={currentUser} onClick={() => onViewAlbum(album)} />
                                ))}
                            </div>
                            {publicCollection.length > 8 && (
                                <div className="text-center mt-6">
                                    <button onClick={() => setIsCollectionExpanded(!isCollectionExpanded)} className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition">
                                        {isCollectionExpanded ? 'Show Less' : 'Show All'}
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <p className="text-gray-400 italic">This user's collection is private or empty.</p>
                    )}
                </Section>
                
                 {/* For Trade */}
                <Section title="For Trade" count={user.tradeList.length} icon={<TradeIcon className="w-6 h-6"/>}>
                    {user.tradeList.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {user.tradeList.map(album => (
                                <div key={album.album} className="bg-gray-900/50 p-3 rounded-lg flex items-center gap-4">
                                    <img src={album.coverArtUrls[0]} alt={album.album} className="w-16 h-16 rounded-md object-cover"/>
                                    <div className="flex-1">
                                        <p className="font-bold text-white">{album.album}</p>
                                        <p className="text-sm text-gray-400">{album.artist}</p>
                                        <p className="text-xs text-teal-300 font-mono mt-1">{album.condition}</p>
                                    </div>
                                    {!isCurrentUserProfile && (
                                        <button onClick={() => onInitiateTrade(album, user)} className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-1 px-3 rounded-lg text-sm transition">
                                            Offer Trade
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-400 italic">This user has no items available for trade.</p>
                    )}
                </Section>
                
                {/* Wishlist */}
                <Section title="Wishlist" count={user.wishlist.length} icon={<StarIcon className="w-6 h-6"/>}>
                     {user.wishlist.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {user.wishlist.map(album => (
                                <div key={album.album} className="bg-gray-900/50 p-3 rounded-lg flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-md bg-gray-700 flex-shrink-0">
                                      {album.coverArtUrl && <img src={album.coverArtUrl} alt={album.album} className="w-full h-full object-cover rounded-md"/>}
                                    </div>
                                    <div>
                                        <p className="font-bold text-white">{album.album}</p>
                                        <p className="text-sm text-gray-400">{album.artist}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-400 italic">This user's wishlist is empty.</p>
                    )}
                </Section>

                {/* Recent Activity */}
                <Section title="Recent Activity" icon={<CommunityIcon className="w-6 h-6"/>}>
                     {userActivity.length > 0 ? (
                        <div className="space-y-3">
                            {userActivity.map(activity => (
                                <div key={activity.id} className="bg-gray-900/50 p-3 rounded-lg flex items-center gap-4 text-sm">
                                    <img src={activity.album.coverArtUrl} alt={activity.album.album} className="w-12 h-12 rounded-md object-cover"/>
                                    <div className="flex-1">
                                        <p className="text-gray-300">
                                            {activityTextMap[activity.type] || 'Activity on'} <span className="font-bold text-white">{activity.album.album}</span>
                                        </p>
                                        {activity.details?.rating && <div className="mt-1"><StarRating rating={activity.details.rating} isDisplayOnly /></div>}
                                        {activity.details?.comment && <p className="text-xs italic text-gray-400 mt-1">"{activity.details.comment}"</p>}
                                        {activity.details?.review && <p className="text-xs italic text-gray-400 mt-1">"{activity.details.review.substring(0, 100)}..."</p>}
                                    </div>
                                    <span className="text-xs text-gray-500 self-start">{new Date(activity.timestamp).toLocaleDateString()}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-400 italic">No recent activity.</p>
                    )}
                </Section>
            </div>
        </div>
    );
};

export default UserProfilePage;
