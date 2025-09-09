import React, { useState, useMemo } from 'react';
import type { CollectionAlbumInfo, AlbumInfo, User, TradeOffer } from '../types';
import MyTradeListPage from './MyTradeListPage';
import TradeMatchesPage from './TradeMatchesPage';
import { RecordIcon } from './icons/RecordIcon';
import { TradeIcon } from './icons/TradeIcon';

interface TradesPageProps {
  currentUser: User;
  allUsers: User[];
  myTradeList: CollectionAlbumInfo[];
  // FIX: Expect the full User object, as it's needed by child components and callbacks.
  tradeMatches: { album: AlbumInfo, user: User }[];
  tradeOffers: TradeOffer[];
  onInitiateTrade: (album: CollectionAlbumInfo, user: User) => void;
  onAcceptTrade: (offer: TradeOffer) => void;
  onRejectTrade: (offerId: string) => void;
  onViewProfile: (userId: string) => void;
}

type TradeView = 'matches' | 'browse' | 'offers' | 'myList';

const BrowseTradesPage: React.FC<{ allUsers: User[], currentUser: User, onInitiateTrade: TradesPageProps['onInitiateTrade'], onViewProfile: TradesPageProps['onViewProfile'] }> = ({ allUsers, currentUser, onInitiateTrade, onViewProfile }) => {
    const allTradableItems = useMemo(() => {
        return allUsers
            .filter(user => user.id !== currentUser.id)
            .flatMap(user => 
                user.tradeList.map(album => ({ user, album }))
            );
    }, [allUsers, currentUser.id]);

    return (
        <div className="space-y-4">
            {allTradableItems.map(({ user, album }) => (
                <div key={`${user.id}-${album.artist}-${album.album}`} className="bg-gray-800 p-4 rounded-lg border border-gray-700 flex flex-col sm:flex-row gap-4 items-center">
                    <img src={album.coverArtUrls[0]} alt={album.album} className="w-20 h-20 rounded-md object-cover"/>
                    <div className="flex-1 text-center sm:text-left">
                        <h3 className="font-bold text-lg text-white">{album.album}</h3>
                        <p className="text-gray-300">{album.artist}</p>
                        <div className="flex items-center gap-3 mt-2 justify-center sm:justify-start">
                            <button onClick={() => onViewProfile(user.id)} title={`View ${user.name}'s profile`}>
                                <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full" />
                            </button>
                            <p className="text-sm">
                                <span className="text-gray-400">Offered by: </span>
                                <button onClick={() => onViewProfile(user.id)} className="font-semibold text-white hover:underline">{user.name}</button>
                            </p>
                        </div>
                    </div>
                     <button 
                        onClick={() => onInitiateTrade(album, user)}
                        className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded-lg transition"
                    >
                        <TradeIcon className="w-5 h-5"/>
                        Propose Trade
                    </button>
                </div>
            ))}
        </div>
    );
};


const TradeOffersPage: React.FC<{ offers: TradeOffer[], currentUserId: string, onAccept: (offer: TradeOffer) => void, onReject: (id: string) => void, onViewProfile: (userId: string) => void }> = ({ offers, currentUserId, onAccept, onReject, onViewProfile }) => {
    const incoming = offers.filter(o => o.toUser.id === currentUserId && o.status === 'pending');
    const outgoing = offers.filter(o => o.fromUser.id === currentUserId && o.status === 'pending');
    
    const OfferCard: React.FC<{offer: TradeOffer, type: 'incoming' | 'outgoing'}> = ({ offer, type }) => (
        <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700/50">
            <div className="flex justify-between items-center text-xs text-gray-400 mb-2">
                <span>
                     {type === 'incoming' ? (
                        <>From: <button onClick={() => onViewProfile(offer.fromUser.id)} className="font-semibold text-gray-300 hover:underline">{offer.fromUser.name}</button></>
                    ) : (
                        <>To: <button onClick={() => onViewProfile(offer.toUser.id)} className="font-semibold text-gray-300 hover:underline">{offer.toUser.name}</button></>
                    )}
                </span>
                <span>{new Date(offer.timestamp).toLocaleDateString()}</span>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-4">
                {/* Offered Items */}
                <div className="flex-1 flex flex-col items-center">
                    <p className="font-semibold mb-2">{type === 'incoming' ? 'They offer:' : 'You offer:'}</p>
                    <div className="flex -space-x-4">
                        {offer.offeredAlbums.map(album => (
                           <img key={album.album} src={album.coverArtUrls[0]} alt={album.album} title={`${album.album} (${album.condition})`} className="w-16 h-16 rounded-full object-cover border-2 border-gray-700"/>
                        ))}
                    </div>
                </div>
                {/* Swap Icon */}
                <TradeIcon className="w-8 h-8 text-teal-400 shrink-0"/>
                {/* Wanted Item */}
                <div className="flex-1 flex flex-col items-center">
                    <p className="font-semibold mb-2">For your:</p>
                    <img src={offer.wantedAlbum.coverArtUrls[0]} alt={offer.wantedAlbum.album} title={offer.wantedAlbum.album} className="w-16 h-16 rounded-full object-cover border-2 border-gray-700"/>
                </div>
            </div>
             {type === 'incoming' && (
                <div className="flex justify-center gap-3 mt-4">
                    <button onClick={() => onAccept(offer)} className="bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-4 rounded-lg text-sm">Accept</button>
                    <button onClick={() => onReject(offer.id)} className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-4 rounded-lg text-sm">Reject</button>
                </div>
            )}
        </div>
    );
    
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-xl font-bold text-white mb-4">Incoming Offers ({incoming.length})</h3>
                {incoming.length > 0 ? (
                    <div className="space-y-3">{incoming.map(o => <OfferCard key={o.id} offer={o} type="incoming"/>)}</div>
                ) : <p className="text-gray-400">No pending incoming offers.</p>}
            </div>
             <div>
                <h3 className="text-xl font-bold text-white mb-4">Outgoing Offers ({outgoing.length})</h3>
                 {outgoing.length > 0 ? (
                    <div className="space-y-3">{outgoing.map(o => <OfferCard key={o.id} offer={o} type="outgoing"/>)}</div>
                ) : <p className="text-gray-400">No pending outgoing offers.</p>}
            </div>
        </div>
    );
}


const TradesPage: React.FC<TradesPageProps> = (props) => {
  const { currentUser, allUsers, myTradeList, tradeMatches, tradeOffers, onInitiateTrade, onAcceptTrade, onRejectTrade, onViewProfile } = props;
  const [activeView, setActiveView] = useState<TradeView>('matches');
  
  const pendingIncomingOffersCount = tradeOffers.filter(o => o.toUser.id === currentUser.id && o.status === 'pending').length;

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
        <h2 className="text-3xl font-bold text-white">Trades</h2>
        <div className="flex flex-wrap items-center gap-2 p-1 bg-gray-800 rounded-lg border border-gray-700">
            <button 
                onClick={() => setActiveView('matches')} 
                className={`px-3 py-1 text-sm font-semibold rounded-md transition relative ${activeView === 'matches' ? 'bg-teal-500 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
            >
                Trade Matches
                {tradeMatches.length > 0 && (
                     <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold">{tradeMatches.length}</span>
                )}
            </button>
             <button 
                onClick={() => setActiveView('browse')} 
                className={`px-3 py-1 text-sm font-semibold rounded-md transition ${activeView === 'browse' ? 'bg-teal-500 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
            >
                Browse All
            </button>
             <button 
                onClick={() => setActiveView('offers')} 
                className={`px-3 py-1 text-sm font-semibold rounded-md transition relative ${activeView === 'offers' ? 'bg-teal-500 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
            >
                My Offers
                 {pendingIncomingOffersCount > 0 && (
                     <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold">{pendingIncomingOffersCount}</span>
                )}
            </button>
            <button 
                onClick={() => setActiveView('myList')} 
                className={`px-3 py-1 text-sm font-semibold rounded-md transition ${activeView === 'myList' ? 'bg-teal-500 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
            >
                My Trade List ({myTradeList.length})
            </button>
        </div>
      </div>
      
      {
        {
          'myList': <MyTradeListPage tradeList={myTradeList} />,
          'matches': <TradeMatchesPage matches={tradeMatches} onInitiateTrade={(album, user) => onInitiateTrade(user.tradeList.find(a => a.artist === album.artist && a.album === album.album)!, user)} />,
          'browse': <BrowseTradesPage allUsers={allUsers} currentUser={currentUser} onInitiateTrade={onInitiateTrade} onViewProfile={onViewProfile} />,
          'offers': <TradeOffersPage offers={tradeOffers} currentUserId={currentUser.id} onAccept={onAcceptTrade} onReject={onRejectTrade} onViewProfile={onViewProfile} />
        }[activeView]
      }
    </div>
  );
};

export default TradesPage;