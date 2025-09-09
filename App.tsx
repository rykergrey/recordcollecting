
import React, { useState, useMemo, useEffect } from 'react';
import Header from './components/Header';
import CollectionPage from './components/CollectionPage';
import WishlistPage from './components/WishlistPage';
import InsightsPage from './components/InsightsPage';
import AlbumScanner from './components/AlbumScanner';
import CommunityPage from './components/CommunityPage';
import TradesPage from './components/TradesPage';
import AddToCollectionModal from './components/AddToCollectionModal';
import AlbumPage from './components/AlbumPage';
import ProposeTradeModal from './components/ProposeTradeModal';
import UserProfilePage from './components/UserProfilePage';
import * as api from './services/apiService';

import type { AlbumInfo, CollectionAlbumInfo, AlbumAnalysisResult, ArtistAlbumSearchResult, User, ActivityEvent, TradeOffer, AlbumCondition, OfferedAlbum } from './types';
import { ScanIcon } from './components/icons/ScanIcon';
import { RecordIcon } from './components/icons/RecordIcon';
import { StarIcon } from './components/icons/StarIcon';
import { InsightsIcon } from './components/icons/InsightsIcon';
import { TradeIcon } from './components/icons/TradeIcon';
import { CommunityIcon } from './components/icons/CommunityIcon';
import { Spinner } from './components/Spinner';

type View = { page: 'tabs' } | { page: 'album'; albumId: string } | { page: 'profile'; userId: string };
type Tab = 'scanner' | 'collection' | 'wishlist' | 'insights' | 'trades' | 'community';
type SearchMode = 'scan' | 'text';

interface TabButtonProps {
    icon: React.ReactElement<{ className?: string }>;
    label: string;
    isActive: boolean;
    onClick: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ icon, label, isActive, onClick }) => {
    const activeClasses = 'border-teal-400 text-teal-400';
    const inactiveClasses = 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500';
    return (
        <button
            onClick={onClick}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm inline-flex items-center gap-2 transition-colors ${isActive ? activeClasses : inactiveClasses}`}
            aria-current={isActive ? 'page' : undefined}
        >
            {React.cloneElement(icon, { className: 'w-5 h-5' })}
            {label}
        </button>
    );
};

const getAlbumId = (album: { artist: string; album: string }) => `${album.artist}-${album.album}`.toLowerCase().replace(/\s/g, '-');

const App: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('scanner');
    const [currentView, setCurrentView] = useState<View>({ page: 'tabs' });
    
    // App Data State
    const [appIsLoading, setAppIsLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [myCollection, setMyCollection] = useState<CollectionAlbumInfo[]>([]);
    const [myWishlist, setMyWishlist] = useState<AlbumInfo[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [activityFeed, setActivityFeed] = useState<ActivityEvent[]>([]);
    const [stores, setStores] = useState<string[]>([]);
    const [tradeOffers, setTradeOffers] = useState<TradeOffer[]>([]);

    // Load initial data
    const loadData = async () => {
        try {
            setAppIsLoading(true);
            const [user, collection, wishlist, allUsers, feed, tradeOffersData, storeData] = await Promise.all([
                api.getCurrentUser(),
                api.getCollection(),
                api.getWishlist(),
                api.getAllUsers(),
                api.getActivityFeed(),
                api.getTradeOffers(),
                api.getStores(),
            ]);
            setCurrentUser(user);
            setMyCollection(collection);
            setMyWishlist(wishlist);
            setUsers(allUsers);
            setActivityFeed(feed);
            setTradeOffers(tradeOffersData);
            setStores(storeData);
        } catch (err) {
            console.error("Failed to load app data:", err);
            setError("Could not load application data. Please refresh the page.");
        } finally {
            setAppIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const [addModalData, setAddModalData] = useState<{ analysis: AlbumAnalysisResult, userImage?: string } | null>(null);
    const [proposeTradeData, setProposeTradeData] = useState<{ wantedAlbum: CollectionAlbumInfo, toUser: User } | null>(null);

    // Derived state
    const myTradeList = useMemo(() => myCollection.filter(a => a.forTrade), [myCollection]);
    const followedUsers = useMemo(() => new Set(currentUser?.followedUserIds || []), [currentUser]);

    // State lifted from AlbumScanner
    const [searchMode, setSearchMode] = useState<SearchMode>('scan');
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [base64Image, setBase64Image] = useState<string | null>(null);
    const [query, setQuery] = useState('');
    const [searchResults, setSearchResults] = useState<ArtistAlbumSearchResult[]>([]);
    const [albumAnalysis, setAlbumAnalysis] = useState<Partial<AlbumAnalysisResult> | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingStep, setLoadingStep] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [hasAddedToWishlist, setHasAddedToWishlist] = useState(false);
    
    const handleViewAlbum = (album: CollectionAlbumInfo) => {
        setCurrentView({ page: 'album', albumId: getAlbumId(album) });
    };

    const handleViewProfile = (userId: string) => {
        setCurrentView({ page: 'profile', userId });
    };

    const handleReturnToList = () => {
        setCurrentView({ page: 'tabs' });
    };

    const openAddToCollectionModal = (analysis: AlbumAnalysisResult, userImage?: string) => {
        setAddModalData({ analysis, userImage });
    };

    const handleConfirmAddToCollection = async (purchaseDetails: { price: number, store: string }) => {
        if (!addModalData) return;
        const { analysis, userImage } = addModalData;
        
        try {
            const { updatedCollection, updatedWishlist, updatedStores } = await api.addToCollection(analysis, purchaseDetails, userImage);
            setMyCollection(updatedCollection);
            setMyWishlist(updatedWishlist);
            setStores(updatedStores);
            setAddModalData(null);
        } catch (err) {
             console.error("Failed to add to collection:", err);
             setError("There was an error saving your album.");
        }
    };

    const resetScannerState = (clearImage: boolean = true, clearQuery: boolean = true) => {
        if (clearImage) {
            setPreviewUrl(null);
            setBase64Image(null);
        }
        if (clearQuery) {
            setQuery('');
        }
        setAlbumAnalysis(null);
        setIsLoading(false);
        setLoadingStep('');
        setError(null);
        setHasAddedToWishlist(false);
        setSearchResults([]);
    };

    const fetchDetailsForAlbum = async (selectedAlbum: { artist: string, album: string, year?: number }) => {
        // isLoading is already true from the caller (handleScan/handleTextSearch)
        setError(null);
        // Clear previous analysis to ensure a clean slate for the progressive render
        setAlbumAnalysis(null);
        setHasAddedToWishlist(false);
        setSearchResults([]);
        setQuery(`${selectedAlbum.artist} - ${selectedAlbum.album}`);

        // Step 1: Immediately set initial data and stop the main spinner.
        // This allows the AlbumScanner component to render the initial results frame.
        setAlbumAnalysis({
            artist: selectedAlbum.artist,
            album: selectedAlbum.album,
            year: selectedAlbum.year,
        });
        setIsLoading(false);
        setLoadingStep('');

        try {
            // Step 2 & 3: Fetch tracks and full analysis in parallel for performance
            const tracksPromise = api.getSuggestedTracks(selectedAlbum);
            const analysisPromise = api.getFullAlbumAnalysis(selectedAlbum);

            // Await tracks and update UI as soon as they are ready
            const tracks = await tracksPromise;
            setAlbumAnalysis(prev => ({ ...prev, tracklist: tracks }));

            // Await full analysis and update UI with the rest of the data
            const fullAnalysis = await analysisPromise;
            setAlbumAnalysis(prev => ({ ...prev, ...fullAnalysis }));

        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        }
    };

    const handleFileChange = (file: File) => {
        resetScannerState();
        const reader = new FileReader();
        reader.onloadend = () => {
            const url = reader.result as string;
            setPreviewUrl(url);
            const base64 = url.split(',')[1];
            setBase64Image(base64);
        };
        reader.readAsDataURL(file);
    };

    const handleScan = async (image: { base64: string, mimeType: string }) => {
        resetScannerState(false, true); // keep image, clear query
        setIsLoading(true);
        try {
          setLoadingStep('Identifying album...');
          const identifiedAlbum = await api.identifyAlbumFromImage(image.base64, image.mimeType);
          await fetchDetailsForAlbum(identifiedAlbum);
        } catch (err) {
          console.error(err);
          setError(err instanceof Error ? err.message : 'An unknown error occurred.');
          setIsLoading(false);
        }
    };

    const handleTextSearch = async () => {
        if (!query.trim()) {
            setError("Please enter an artist or album name.");
            return;
        }
        resetScannerState(true, false); // clear image, keep query
        setIsLoading(true);
        setLoadingStep(`Searching for "${query}"...`);
        try {
            const results = await api.searchAlbumsByArtist(query);
            if (results.length === 1) {
                await fetchDetailsForAlbum(results[0]);
            } else if (results.length > 1) {
                setSearchResults(results);
                setIsLoading(false);
                setLoadingStep('');
            } else {
                setError(`No results found for "${query}".`);
                setIsLoading(false);
                setLoadingStep('');
            }
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            setIsLoading(false);
            setLoadingStep('');
        }
    };
    
    const scannerOnAddToWishlist = async () => {
        if (!albumAnalysis || !albumAnalysis.artist || !albumAnalysis.album) return;
        const coverUrl = previewUrl || (albumAnalysis.coverArtUrls && albumAnalysis.coverArtUrls[0]) || '';
        try {
            const newWishlist = await api.addToWishlist({ 
                artist: albumAnalysis.artist,
                album: albumAnalysis.album,
                coverArtUrl: coverUrl 
            });
            setMyWishlist(newWishlist);
            setHasAddedToWishlist(true);
        } catch (err) {
            console.error("Failed to add to wishlist:", err);
            setError("There was an error adding to your wishlist.");
        }
    };

    const handleUpdateAlbumRating = async (albumId: string, rating: number) => {
        const updatedAlbum = await api.updateAlbumRating(albumId, rating);
        setMyCollection(current => current.map(album => getAlbumId(album) === albumId ? updatedAlbum : album));
    };

    const handleUpdateTrackRating = async (albumId: string, trackTitle: string, rating: number) => {
        const updatedAlbum = await api.updateTrackRating(albumId, trackTitle, rating);
        setMyCollection(current => current.map(album => getAlbumId(album) === albumId ? updatedAlbum : album));
    };

    const handleAddComment = async (albumId: string, text: string) => {
        const updatedAlbum = await api.addComment(albumId, text);
        setMyCollection(current => current.map(album => getAlbumId(album) === albumId ? updatedAlbum : album));
    };
    
    const handleUpdateWishlistPriority = async (albumId: string, priority: 'High' | 'Medium' | 'Low') => {
        const updatedWishlist = await api.updateWishlistPriority(albumId, priority);
        setMyWishlist(updatedWishlist);
    };
    
    const handleToggleFollow = async (userId: string) => {
        const { updatedCurrentUser, updatedAllUsers } = await api.toggleFollowUser(userId);
        setCurrentUser(updatedCurrentUser);
        setUsers(updatedAllUsers);
    };

    const handleGoToTradeMatches = () => {
        setActiveTab('trades');
    };

    const handleNotificationClick = (id: string, relatedId?: string) => {
        if (id === 'matches') {
            setActiveTab('trades');
        } else if (id === 'offers') {
            setActiveTab('trades');
        } else if (id === 'shareRequest' && relatedId) {
            setCurrentView({ page: 'profile', userId: relatedId });
        }
    }

    const handleUpdateTradeStatus = async (albumId: string, forTrade: boolean, condition?: AlbumCondition) => {
        const { updatedAlbum, updatedCollection } = await api.updateTradeStatus(albumId, forTrade, condition);
        setMyCollection(updatedCollection);
    };

    const handleInitiateTrade = (wantedAlbum: CollectionAlbumInfo, toUser: User) => {
        setProposeTradeData({ wantedAlbum, toUser });
    };

    const handleSendTradeOffer = async (offer: { toUser: User; wantedAlbum: CollectionAlbumInfo; offeredAlbums: OfferedAlbum[] }) => {
        const newOffer = await api.sendTradeOffer(offer);
        setTradeOffers(prev => [...prev, newOffer]);
        setProposeTradeData(null);
    };
    
    const handleAcceptTrade = async (offer: TradeOffer) => {
        console.log("Accepting trade:", offer.id);
        const result = await api.acceptTrade(offer.id);
        setTradeOffers(result.updatedOffers);
        setMyCollection(result.updatedCollection);
        // In a real app, you'd probably refetch all users or get updated user data back
        setUsers(result.updatedUsers);
    };
    
    const handleRejectTrade = async (offerId: string) => {
        const updatedOffers = await api.rejectTrade(offerId);
        setTradeOffers(updatedOffers);
    };

    const handleSendShareRequest = async (toUserId: string) => {
        const { updatedCurrentUser, updatedAllUsers } = await api.sendLibraryShareRequest(toUserId);
        setCurrentUser(updatedCurrentUser);
        setUsers(updatedAllUsers);
    };

    const handleAcceptShareRequest = async (fromUserId: string) => {
        const { updatedCurrentUser, updatedAllUsers, mergedCollection } = await api.acceptLibraryShareRequest(fromUserId);
        setCurrentUser(updatedCurrentUser);
        setUsers(updatedAllUsers);
        setMyCollection(mergedCollection);
    };

    const handleRejectShareRequest = async (fromUserId: string) => {
        const { updatedCurrentUser, updatedAllUsers } = await api.rejectLibraryShareRequest(fromUserId);
        setCurrentUser(updatedCurrentUser);
        setUsers(updatedAllUsers);
    };

    const allPublicUsers = useMemo(() => users.filter(u => u.id !== currentUser?.id), [users, currentUser]);
    
    const tradeMatches = useMemo(() => {
        if (!currentUser) return [];
        return myWishlist.flatMap(wishlistItem => {
            const matches = [];
            for (const user of allPublicUsers) {
                if (user.tradeList.some(tradeItem => getAlbumId(tradeItem) === getAlbumId(wishlistItem))) {
                    matches.push({
                        album: wishlistItem,
                        user: { ...user },
                    });
                }
            }
            return matches;
        });
    }, [myWishlist, allPublicUsers, currentUser]);
    
    const matchedWishlistAlbumIds = useMemo(() => new Set(tradeMatches.map(match => getAlbumId(match.album))), [tradeMatches]);
    const pendingIncomingOffers = useMemo(() => tradeOffers.filter(o => o.toUser.id === currentUser?.id && o.status === 'pending'), [tradeOffers, currentUser]);
    
    const notifications = useMemo(() => {
        const notifs: { id: string, text: string, relatedId?: string }[] = [];
        if (tradeMatches.length > 0) notifs.push({ id: 'matches', text: `You have ${tradeMatches.length} new trade match(es)!`});
        if (pendingIncomingOffers.length > 0) notifs.push({ id: 'offers', text: `You have ${pendingIncomingOffers.length} new trade offer(s)!`});
        
        const shareRequests = currentUser?.libraryShareRequests || {};
        Object.entries(shareRequests).forEach(([userId, status]) => {
            if (status === 'received') {
                const fromUser = users.find(u => u.id === userId);
                if(fromUser) {
                    notifs.push({ id: 'shareRequest', text: `${fromUser.name} wants to share their library.`, relatedId: fromUser.id });
                }
            }
        });

        return notifs;
    }, [tradeMatches.length, pendingIncomingOffers.length, currentUser, users]);

    const renderTabs = () => (
        <>
            <div className="mb-8 border-b border-gray-700">
                <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                    <TabButton icon={<ScanIcon />} label="Scanner" isActive={activeTab === 'scanner'} onClick={() => setActiveTab('scanner')} />
                    <TabButton icon={<RecordIcon />} label="Collection" isActive={activeTab === 'collection'} onClick={() => setActiveTab('collection')} />
                    <TabButton icon={<StarIcon />} label="Wishlist" isActive={activeTab === 'wishlist'} onClick={() => setActiveTab('wishlist')} />
                    <TabButton icon={<InsightsIcon />} label="Insights" isActive={activeTab === 'insights'} onClick={() => setActiveTab('insights')} />
                    <TabButton icon={<TradeIcon />} label="Trades" isActive={activeTab === 'trades'} onClick={() => setActiveTab('trades')} />
                    <TabButton icon={<CommunityIcon />} label="Community" isActive={activeTab === 'community'} onClick={() => setActiveTab('community')} />
                </nav>
            </div>
            {
                {
                    'scanner': <AlbumScanner
                        collection={myCollection}
                        wishlist={myWishlist}
                        allUsers={users}
                        searchMode={searchMode}
                        previewUrl={previewUrl}
                        base64Image={base64Image}
                        query={query}
                        searchResults={searchResults}
                        albumAnalysis={albumAnalysis}
                        isLoading={isLoading}
                        loadingStep={loadingStep}
                        error={error}
                        hasAddedToWishlist={hasAddedToWishlist}
                        setQuery={setQuery}
                        onSetSearchMode={(mode: SearchMode) => {
                            setSearchMode(mode);
                            resetScannerState(true, true);
                        }}
                        onFileChange={handleFileChange}
                        onScan={handleScan}
                        onTextSearch={handleTextSearch}
                        onFetchDetailsForAlbum={fetchDetailsForAlbum}
                        onInitiateAddToCollection={openAddToCollectionModal as (analysis: AlbumAnalysisResult, userImage?: string) => void}
                        onAddToWishlist={scannerOnAddToWishlist}
                        onGoToTradeMatches={handleGoToTradeMatches}
                    />,
                    'collection': <CollectionPage collection={myCollection} currentUser={currentUser!} onViewAlbum={handleViewAlbum} />,
                    'wishlist': <WishlistPage 
                                    wishlist={myWishlist} 
                                    onUpdatePriority={handleUpdateWishlistPriority}
                                    matchedAlbumIds={matchedWishlistAlbumIds}
                                    onGoToTradeMatches={handleGoToTradeMatches}
                                />,
                    'insights': <InsightsPage collection={myCollection} />,
                    'trades': <TradesPage 
                                currentUser={currentUser!}
                                allUsers={users}
                                myTradeList={myTradeList} 
                                tradeMatches={tradeMatches} 
                                tradeOffers={tradeOffers}
                                onInitiateTrade={handleInitiateTrade}
                                onAcceptTrade={handleAcceptTrade}
                                onRejectTrade={handleRejectTrade}
                                onViewProfile={handleViewProfile}
                            />,
                    'community': <CommunityPage 
                        activityFeed={activityFeed}
                        allUsers={users}
                        followedUsers={followedUsers}
                        onToggleFollow={handleToggleFollow}
                        onViewProfile={handleViewProfile}
                    />,
                }[activeTab]
            }
        </>
    );

    const albumForPage = currentView.page === 'album' 
        ? myCollection.find(a => getAlbumId(a) === currentView.albumId) 
        : null;
        
    const userForProfile = currentView.page === 'profile'
        ? users.find(u => u.id === currentView.userId)
        : null;

    if (appIsLoading || !currentUser) {
        return (
            <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center gap-4 text-gray-300">
                <Spinner className="w-12 h-12 text-teal-400" />
                <p className="font-medium text-lg">Loading RecordCollect.ing...</p>
            </div>
        );
    }
    
    const renderContent = () => {
        switch (currentView.page) {
            case 'tabs':
                return renderTabs();
            case 'album':
                return albumForPage ? (
                    <AlbumPage
                        album={albumForPage}
                        allUsers={users}
                        currentUser={currentUser}
                        onBack={handleReturnToList}
                        onUpdateAlbumRating={(r) => handleUpdateAlbumRating(currentView.albumId!, r)}
                        onUpdateTrackRating={(title, r) => handleUpdateTrackRating(currentView.albumId!, title, r)}
                        onAddComment={(text) => handleAddComment(currentView.albumId!, text)}
                        onUpdateTradeStatus={handleUpdateTradeStatus}
                        onInitiateTrade={handleInitiateTrade}
                        onViewProfile={handleViewProfile}
                    />
                ) : (
                    <div className="text-center">
                        <h2 className="text-2xl font-bold">Album not found</h2>
                        <button onClick={handleReturnToList} className="mt-4 px-4 py-2 bg-teal-500 rounded-lg">Back to Collection</button>
                    </div>
                );
            case 'profile':
                 return userForProfile ? (
                     <UserProfilePage
                        user={userForProfile}
                        currentUser={currentUser}
                        isFollowing={followedUsers.has(userForProfile.id)}
                        activityFeed={activityFeed}
                        onBack={handleReturnToList}
                        onToggleFollow={handleToggleFollow}
                        onInitiateTrade={handleInitiateTrade}
                        onSendShareRequest={handleSendShareRequest}
                        onAcceptShareRequest={handleAcceptShareRequest}
                        onRejectShareRequest={handleRejectShareRequest}
                        onViewAlbum={(album) => {
                            const collectionAlbum = album as CollectionAlbumInfo;
                            if (collectionAlbum.provenance && collectionAlbum.provenance.length > 0) {
                                 handleViewAlbum(collectionAlbum);
                            }
                        }}
                     />
                 ) : (
                    <div className="text-center">
                        <h2 className="text-2xl font-bold">User not found</h2>
                        <button onClick={handleReturnToList} className="mt-4 px-4 py-2 bg-teal-500 rounded-lg">Back to Main</button>
                    </div>
                );
            default:
                return renderTabs();
        }
    }


    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
            <Header 
                user={currentUser} 
                notifications={notifications}
                onNotificationClick={handleNotificationClick}
            />
            <main className="container mx-auto px-4 py-8">
                {renderContent()}
            </main>
            {addModalData && (
                <AddToCollectionModal
                    albumInfo={addModalData.analysis}
                    coverArtUrl={addModalData.userImage || (addModalData.analysis.coverArtUrls && addModalData.analysis.coverArtUrls[0]) || ''}
                    stores={stores}
                    onClose={() => setAddModalData(null)}
                    onSave={handleConfirmAddToCollection}
                />
            )}
            {proposeTradeData && (
                <ProposeTradeModal 
                    currentUser={currentUser}
                    toUser={proposeTradeData.toUser}
                    wantedAlbum={proposeTradeData.wantedAlbum}
                    myTradeList={myTradeList}
                    onClose={() => setProposeTradeData(null)}
                    onSendOffer={handleSendTradeOffer}
                />
            )}
            <footer className="text-center py-4 text-gray-500 text-sm">
                <p>2025 RecordCollect.ing | Powered by Rykersoft.</p>
            </footer>
        </div>
    );
};

export default App;
