
import React, { useState, useMemo } from 'react';
import type { CollectionAlbumInfo, AlbumCondition, User } from '../types';
import StarRating from './StarRating';
import TracklistItem from './TracklistItem';
import Comments from './Comments';
import { YouTubeIcon } from './icons/YouTubeIcon';
import { HistoryIcon } from './icons/HistoryIcon';
import { TradeIcon } from './icons/TradeIcon';
import { CommunityIcon } from './icons/CommunityIcon';
import { getPersonalRecommendation } from '../services/apiService';
import { StarIcon } from './icons/StarIcon';
import { Spinner } from './Spinner';


interface AlbumPageProps {
  album: CollectionAlbumInfo;
  allUsers: User[];
  currentUser: User;
  onBack: () => void;
  onUpdateAlbumRating: (rating: number) => void;
  onUpdateTrackRating: (trackTitle: string, rating: number) => void;
  onAddComment: (text: string) => void;
  onUpdateTradeStatus: (albumId: string, forTrade: boolean, condition?: AlbumCondition) => void;
  onInitiateTrade: (wantedAlbum: CollectionAlbumInfo, toUser: User) => void;
  onViewProfile: (userId: string) => void;
}

const DetailSection: React.FC<{ title: string, children: React.ReactNode, icon?: React.ReactElement }> = ({ title, children, icon }) => (
    <div className="mt-8">
        <h3 className="text-2xl font-bold text-teal-300 mb-3 pb-2 border-b-2 border-gray-700 flex items-center gap-3">
            {icon}
            {title}
        </h3>
        <div className="text-gray-300 leading-relaxed space-y-4 prose prose-invert prose-p:text-gray-300">
            {children}
        </div>
    </div>
);

const conditionOptions: AlbumCondition[] = ['Mint (M)', 'Near Mint (NM)', 'Very Good Plus (VG+)', 'Very Good (VG)', 'Good Plus (G+)', 'Good (G)', 'Fair (F)', 'Poor (P)'];
const getAlbumId = (a: { artist: string; album: string; }) => `${a.artist}-${a.album}`.toLowerCase().replace(/\s/g, '-');


const AlbumPage: React.FC<AlbumPageProps> = (props) => {
  const { album, allUsers, currentUser, onBack, onUpdateAlbumRating, onUpdateTrackRating, onAddComment, onUpdateTradeStatus, onInitiateTrade, onViewProfile } = props;
  const [isForTrade, setIsForTrade] = useState(album.forTrade || false);
  const [condition, setCondition] = useState<AlbumCondition>(album.condition || 'Very Good Plus (VG+)');

  const [personalRecommendation, setPersonalRecommendation] = useState<string | null>(null);
  const [isRecLoading, setIsRecLoading] = useState(false);

  const handleGenerateRecommendation = async () => {
      setIsRecLoading(true);
      setPersonalRecommendation(null);
      try {
          const recommendationText = await getPersonalRecommendation(album, currentUser.collection);
          setPersonalRecommendation(recommendationText);
      } catch (err) {
          console.error("Failed to generate recommendation:", err);
          setPersonalRecommendation("Sorry, we couldn't generate a recommendation at this time.");
      } finally {
          setIsRecLoading(false);
      }
  };

  const handleTradeStatusUpdate = () => {
    onUpdateTradeStatus(getAlbumId(album), isForTrade, condition);
    // Maybe show a confirmation toast here in a real app
  };

  const communityActivity = useMemo(() => {
    const albumId = getAlbumId(album);
    
    const otherUsers = allUsers.filter(u => u.id !== currentUser.id);

    const owners = otherUsers.map(user => {
        const isOwner = user.collection.some(a => getAlbumId(a) === albumId) || user.tradeList.some(a => getAlbumId(a) === albumId);
        return isOwner ? user : null;
    }).filter((u): u is User => u !== null);

    if (owners.length === 0) return null;

    const ratings = owners.map(u => album.ratings[u.id]).filter((r): r is number => r !== undefined && r > 0);
    const averageRating = ratings.length > 0 ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length : 0;

    const comments = owners.flatMap(u => (album.userComments[u.id] || []).map(c => ({...c, user: u}))).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const tradeOffers = allUsers
        .filter(u => u.id !== currentUser.id)
        .map(user => ({
            user,
            album: user.tradeList.find(a => getAlbumId(a) === albumId)
        }))
        .filter((item): item is { user: User, album: CollectionAlbumInfo } => !!item.album);


    return {
        ownerCount: owners.length,
        averageRating,
        ratingCount: ratings.length,
        comments: comments.slice(0, 3),
        tradeOffers,
    };
  }, [album, allUsers, currentUser.id]);

  const userRating = album.ratings[currentUser.id] || 0;
  const userComments = album.userComments[currentUser.id] || [];

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
        <button onClick={onBack} className="mb-6 text-teal-400 hover:text-teal-300 font-semibold">
            &larr; Back to Collection
        </button>

      <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-2xl shadow-black/20 overflow-hidden">
        {/* Header */}
        <div className="flex flex-col md:flex-row gap-8 p-8 bg-gray-800/50">
          <img 
            src={album.coverArtUrls[0]} 
            alt={`${album.album} cover`} 
            className="w-full md:w-56 h-56 object-cover rounded-lg shadow-lg shadow-black/40 flex-shrink-0"
          />
          <div className="flex flex-col justify-between">
            <div>
                <h1 className="text-4xl lg:text-5xl font-bold text-white">{album.album}</h1>
                <h2 className="text-2xl lg:text-3xl text-gray-300 mt-1">{album.artist}</h2>
                <p className="text-lg text-gray-400 mt-2">{album.year} &middot; {album.genre}</p>
            </div>
            <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-1">Your Overall Rating</h3>
                <StarRating rating={userRating} onRatingChange={onUpdateAlbumRating} />
            </div>
          </div>
        </div>

        <div className="p-8">
            <p className="text-lg text-gray-200 italic leading-relaxed">{album.albumDescription}</p>

            <DetailSection title="Personal Recommendation" icon={<StarIcon className="w-6 h-6"/>}>
                {!personalRecommendation && !isRecLoading && (
                    <button 
                        onClick={handleGenerateRecommendation}
                        className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded-lg transition"
                    >
                         <StarIcon className="w-5 h-5"/>
                        Generate Personal Recommendation
                    </button>
                )}
                {isRecLoading && (
                    <div className="flex items-center gap-3 text-gray-400">
                        <Spinner className="w-6 h-6" />
                        <span>Generating your recommendation based on your collection...</span>
                    </div>
                )}
                {personalRecommendation && (
                     <div className="p-4 bg-teal-900/50 border border-teal-700 rounded-lg animate-fade-in">
                        <p className="text-teal-100">{personalRecommendation}</p>
                    </div>
                )}
            </DetailSection>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                <DetailSection title="Trade Status" icon={<TradeIcon className="w-6 h-6"/>}>
                    <div className="p-4 bg-gray-900/50 rounded-lg">
                        <div className="flex items-center justify-between">
                            <label htmlFor="for-trade-toggle" className="font-semibold text-white">Make available for trade</label>
                            <input
                                id="for-trade-toggle"
                                type="checkbox"
                                className="h-6 w-11 rounded-full bg-gray-600 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all checked:bg-teal-500 checked:after:translate-x-full focus:outline-none"
                                checked={isForTrade}
                                onChange={e => setIsForTrade(e.target.checked)}
                            />
                        </div>
                        {isForTrade && (
                            <div className="mt-4 animate-fade-in">
                                <label htmlFor="condition" className="block text-sm font-medium text-gray-300 mb-1">Condition</label>
                                <select 
                                    id="condition"
                                    value={condition}
                                    onChange={e => setCondition(e.target.value as AlbumCondition)}
                                    className="w-full bg-gray-700 text-sm text-white rounded-md px-2 py-2 border border-gray-600 focus:outline-none focus:ring-1 focus:ring-teal-500"
                                >
                                    {conditionOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </div>
                        )}
                        <button onClick={handleTradeStatusUpdate} className="mt-4 w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded-lg transition">
                            Update Trade Status
                        </button>
                    </div>
                </DetailSection>

                <DetailSection title="Provenance" icon={<HistoryIcon className="w-6 h-6"/>}>
                    <ul className="space-y-3">
                        {album.provenance.map((p, i) => (
                            <li key={i} className="text-sm p-3 bg-gray-900/50 rounded-md border border-gray-700/50">
                                {p.type === 'purchase' ? (
                                    <>
                                        <p className="font-semibold text-white">Purchased from {p.from}</p>
                                        <p className="text-gray-400">{new Date(p.date).toLocaleDateString()} {p.price ? `for $${p.price.toFixed(2)}` : ''}</p>
                                    </>
                                ) : (
                                     <>
                                        <p className="font-semibold text-white">Traded from {p.from}</p>
                                        <p className="text-gray-400">{new Date(p.date).toLocaleDateString()}</p>
                                     </>
                                )}
                            </li>
                        ))}
                    </ul>
                </DetailSection>
            </div>


            <DetailSection title="Tracklist">
                <div className="space-y-4">
                    {album.tracklist.map((track, index) => (
                        <TracklistItem 
                            key={track.title}
                            trackNumber={index + 1}
                            track={track}
                            currentUserId={currentUser.id}
                            onRatingChange={(rating) => onUpdateTrackRating(track.title, rating)}
                        />
                    ))}
                </div>
            </DetailSection>

            <DetailSection title="Community Activity" icon={<CommunityIcon className="w-6 h-6"/>}>
                {communityActivity ? (
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 text-sm">
                            <StarRating rating={communityActivity.averageRating} isDisplayOnly />
                            <span className="text-gray-300 font-semibold">{communityActivity.averageRating.toFixed(1)}/5</span>
                            <span className="text-gray-400">({communityActivity.ratingCount} ratings from other users)</span>
                        </div>

                        <div>
                            <h4 className="font-semibold text-white mb-2">Available for Trade</h4>
                            {communityActivity.tradeOffers.length > 0 ? (
                                <ul className="space-y-2">
                                    {communityActivity.tradeOffers.map(({ user, album: offeredAlbum }) => (
                                        <li key={user.id} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-md">
                                            <div className="flex items-center gap-3">
                                                <button onClick={() => onViewProfile(user.id)} title={`View ${user.name}'s profile`}>
                                                    <img src={user.avatarUrl} alt={user.name} className="w-9 h-9 rounded-full"/>
                                                </button>
                                                <div>
                                                    <button onClick={() => onViewProfile(user.id)} className="text-sm font-semibold text-white hover:underline">{user.name}</button>
                                                    <p className="text-xs text-teal-300 font-mono">{offeredAlbum.condition}</p>
                                                </div>
                                            </div>
                                            <button onClick={() => onInitiateTrade(offeredAlbum, user)} className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold py-1 px-3 rounded-lg text-sm transition">
                                                <TradeIcon className="w-4 h-4" />
                                                Propose Trade
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            ) : <p className="text-sm text-gray-400">No public trade offers from other users.</p>}
                        </div>

                         <div>
                            <h4 className="font-semibold text-white mb-2">Recent Comments</h4>
                             {communityActivity.comments.length > 0 ? (
                                <div className="space-y-3">
                                  {communityActivity.comments.map(c => (
                                    <div key={`${c.user.id}-${c.timestamp}`} className="flex items-start gap-3">
                                      <button onClick={() => onViewProfile(c.user.id)} className="flex-shrink-0" title={`View ${c.user.name}'s profile`}>
                                        <img src={c.user.avatarUrl} alt={c.user.name} className="w-9 h-9 rounded-full mt-1"/>
                                      </button>
                                      <div className="flex-1 bg-gray-900/50 p-3 rounded-lg">
                                        <button onClick={() => onViewProfile(c.user.id)} className="text-sm font-semibold text-white hover:underline">{c.user.name}</button>
                                        <p className="text-gray-300 italic">"{c.text}"</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                            ) : <p className="text-sm text-gray-400">No public comments from other users yet.</p>}
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-400 italic">No other users have this album in their collection yet.</p>
                )}
            </DetailSection>

            <DetailSection title="Historical Significance">
                <p>{album.historicalSignificance}</p>
            </DetailSection>

            <DetailSection title="Musical Style">
                <p>{album.musicalStyle}</p>
            </DetailSection>
            
            <DetailSection title="Legacy">
                <p>{album.legacy}</p>
            </DetailSection>
            
            <DetailSection title="Explore on YouTube">
                <div className="flex flex-col sm:flex-row gap-3">
                    {album.youtubeLinks.map(link => (
                        <a 
                            key={link.title}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition"
                        >
                            <YouTubeIcon className="w-5 h-5 text-red-500" />
                            <span>{link.title}</span>
                        </a>
                    ))}
                </div>
            </DetailSection>
            
            <DetailSection title="Your Comments">
                <Comments comments={userComments} onAddComment={onAddComment} />
            </DetailSection>

        </div>
      </div>
    </div>
  );
};

export default AlbumPage;
