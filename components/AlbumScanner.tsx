import React, { useRef, useMemo } from 'react';
import type { AlbumInfo, AlbumAnalysisResult, ArtistAlbumSearchResult, CollectionAlbumInfo, User } from '../types';
import { Spinner } from './Spinner';
import { UploadIcon } from './icons/UploadIcon';
import { ScanIcon } from './icons/ScanIcon';
import { AddIcon } from './icons/AddIcon';
import { SearchIcon } from './icons/SearchIcon';
import { getBuyingAdvice, recommendationMeta } from '../utils/buyingAdvice';
import { ThumbsUpIcon } from './icons/ThumbsUpIcon';
import { ThumbsDownIcon } from './icons/ThumbsDownIcon';
import { InfoIcon } from './icons/InfoIcon';
import { StarIcon } from './icons/StarIcon';
import { MusicNoteIcon } from './icons/MusicNoteIcon';
import { YouTubeIcon } from './icons/YouTubeIcon';
import { CommunityIcon } from './icons/CommunityIcon';
import StarRating from './StarRating';
import { TradeIcon } from './icons/TradeIcon';

type SearchMode = 'scan' | 'text';

const getAlbumId = (album: { artist: string; album: string; }) => `${album.artist}-${album.album}`.toLowerCase().replace(/\s/g, '-');

interface AlbumScannerProps {
  collection: CollectionAlbumInfo[];
  wishlist: AlbumInfo[];
  allUsers: User[];
  onInitiateAddToCollection: (analysis: AlbumAnalysisResult, userImage?: string) => void;
  onGoToTradeMatches: () => void;
  
  // State props from parent
  searchMode: SearchMode;
  previewUrl: string | null;
  base64Image: string | null;
  query: string;
  searchResults: ArtistAlbumSearchResult[];
  albumAnalysis: Partial<AlbumAnalysisResult> | null;
  isLoading: boolean;
  loadingStep: string;
  error: string | null;
  hasAddedToWishlist: boolean;

  // Handler props from parent
  setQuery: (query: string) => void;
  onSetSearchMode: (mode: SearchMode) => void;
  onFileChange: (file: File) => void;
  onScan: (image: { base64: string, mimeType: string }) => void;
  onTextSearch: () => void;
  onFetchDetailsForAlbum: (album: { artist: string, album: string }) => void;
  onAddToWishlist: () => void;
}

const AlbumScanner: React.FC<AlbumScannerProps> = (props) => {
  const {
      collection, wishlist, allUsers, onInitiateAddToCollection, onGoToTradeMatches,
      searchMode, previewUrl, base64Image, query, searchResults, albumAnalysis,
      isLoading, loadingStep, error, hasAddedToWishlist,
      setQuery, onSetSearchMode, onFileChange, onScan, onTextSearch,
      onFetchDetailsForAlbum, onAddToWishlist
  } = props;

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileChange(file);
    }
  };
  
  const handleScanClick = () => {
    if (base64Image && fileInputRef.current?.files?.[0]) {
        onScan({
            base64: base64Image,
            mimeType: fileInputRef.current.files[0].type
        });
    }
  };

  const handleTextSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onTextSearch();
  };

  // FIX: Ensure albumAnalysis has artist and album before calling getAlbumId.
  const isAlreadyInCollection = albumAnalysis?.artist && albumAnalysis.album ? collection.some(item => getAlbumId(item) === getAlbumId(albumAnalysis as { artist: string, album: string })) : false;
  // FIX: Ensure albumAnalysis has artist and album before calling getAlbumId.
  const isAlreadyInWishlist = albumAnalysis?.artist && albumAnalysis.album ? wishlist.some(item => getAlbumId(item) === getAlbumId(albumAnalysis as { artist: string, album: string })) : false;

  const recommendation = useMemo(() => albumAnalysis ? getBuyingAdvice(albumAnalysis, collection, wishlist) : null, [albumAnalysis, collection, wishlist]);
  const meta = recommendation ? recommendationMeta[recommendation.level] : null;

  const communityStats = useMemo(() => {
    if (!albumAnalysis || !albumAnalysis.album || !albumAnalysis.artist) return null;
    
    // FIX: Type cast albumAnalysis as it is guaranteed to have artist and album after the check.
    const albumId = getAlbumId(albumAnalysis as { artist: string; album: string; });

    const owners = allUsers.map(user => ({
        user,
        album: user.collection.find(a => getAlbumId(a) === albumId && a.isPublic)
    })).filter((item): item is { user: User, album: CollectionAlbumInfo } => !!item.album);

    if (owners.length === 0) return null;

    // FIX: Access the user's rating from the 'ratings' map using the user's ID.
    const ratings = owners.map(o => o.album!.ratings[o.user.id]).filter((r): r is number => r !== undefined && r > 0);
    const averageRating = ratings.length > 0 ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length : 0;

    // FIX: Access user comments from the 'userComments' map and handle cases with no comments.
    const comments = owners.flatMap(o => (o.album!.userComments[o.user.id] || []).map(c => ({...c, user: o.user}))).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const tradeOffers = owners.filter(o => o.album!.forTrade).map(o => ({ user: o.user, album: o.album! }));

    return {
        ownerCount: owners.length,
        averageRating,
        ratingCount: ratings.length,
        comments: comments.slice(0, 3), // Show top 3 recent comments
        tradeOffers,
    };
  }, [albumAnalysis, allUsers]);


  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-2xl shadow-black/20">
        <div className="flex border-b border-gray-700">
            <button onClick={() => onSetSearchMode('scan')} className={`flex-1 p-4 font-semibold flex items-center justify-center gap-2 transition ${searchMode === 'scan' ? 'bg-gray-700/50 text-teal-400' : 'text-gray-400 hover:bg-gray-700/25'}`}>
                <ScanIcon className="w-5 h-5" /> Scan Cover
            </button>
            <button onClick={() => onSetSearchMode('text')} className={`flex-1 p-4 font-semibold flex items-center justify-center gap-2 transition ${searchMode === 'text' ? 'bg-gray-700/50 text-teal-400' : 'text-gray-400 hover:bg-gray-700/25'}`}>
                <SearchIcon className="w-5 h-5" /> Search by Text
            </button>
        </div>
        
        {searchMode === 'scan' ? (
          <>
            {!previewUrl && (
              <div className="text-center py-8 px-4">
                <h2 className="text-xl font-bold text-white">Scan a Record In-Store</h2>
                <p className="text-gray-400 mt-2">Upload a photo of an album cover for instant analysis.</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-6 inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105"
                >
                  <UploadIcon className="w-5 h-5" />
                  Upload Album Cover
                </button>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/png, image/jpeg, image/webp"/>
              </div>
            )}

            {previewUrl && (
              <div className="flex flex-col md:flex-row gap-6 items-center p-4">
                  <div className="flex-shrink-0 w-full md:w-48">
                  <img src={previewUrl} alt="Album cover preview" className="rounded-lg w-full aspect-square object-cover shadow-lg shadow-black/30"/>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-lg font-semibold text-white">Ready to Scan</h3>
                  <p className="text-gray-400 text-sm mt-1 mb-4">{fileInputRef.current?.files?.[0]?.name}</p>
                  <div className="flex gap-3 justify-center md:justify-start">
                    <button onClick={handleScanClick} disabled={isLoading || !base64Image} className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded-lg transition disabled:bg-gray-500 disabled:cursor-not-allowed">
                      <ScanIcon className="w-5 h-5"/>
                      Get Advice
                    </button>
                    <button onClick={() => fileInputRef.current?.click()} disabled={isLoading} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition">
                      Change Photo
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="py-8 px-4">
              <h2 className="text-xl font-bold text-white text-center">Search by Name</h2>
              <p className="text-gray-400 mt-2 text-center">Enter an artist or album title to get started.</p>
              <form onSubmit={handleTextSearchSubmit} className="mt-6 flex gap-2">
                  <input 
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="e.g., Pink Floyd or Dark Side of the Moon"
                      className="flex-grow bg-gray-700 text-white placeholder-gray-400 rounded-lg px-4 py-3 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <button type="submit" disabled={isLoading} className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-4 rounded-lg transition disabled:bg-gray-500">
                      <SearchIcon className="w-5 h-5" />
                  </button>
              </form>
          </div>
        )}
      </div>

      {isLoading && (
        <div className="text-center my-8 flex flex-col items-center justify-center gap-4 text-gray-300">
          <Spinner className="w-10 h-10 text-teal-400" />
          <p className="font-medium text-lg animate-pulse">{loadingStep}</p>
        </div>
      )}

      {error && !albumAnalysis && (
        <div className="my-6 bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-center">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {searchResults.length > 0 && !isLoading && (
          <div className="mt-6 bg-gray-800 rounded-lg border border-gray-700 p-4">
              <h3 className="font-semibold text-lg text-center mb-4">Did you mean...?</h3>
              <ul className="space-y-2">
                  {searchResults.map(result => (
                      <li key={`${result.artist}-${result.album}`}>
                          <button 
                            onClick={() => onFetchDetailsForAlbum(result)} 
                            className="w-full text-left p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
                          >
                              <span className="font-bold">{result.album}</span>
                              <span className="text-gray-400"> by {result.artist} ({result.year})</span>
                          </button>
                      </li>
                  ))}
              </ul>
          </div>
      )}

      {albumAnalysis && albumAnalysis.artist && albumAnalysis.album && (
        <div className="mt-6 space-y-6">
            <div className="bg-gray-800/70 rounded-lg p-6 border border-gray-700 animate-fade-in">
                <div className="flex flex-col sm:flex-row gap-6 items-center text-center sm:text-left">
                    <img src={previewUrl || (albumAnalysis.coverArtUrls && albumAnalysis.coverArtUrls[0]) || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>'} alt={`${albumAnalysis.album} cover`} className="w-32 h-32 rounded-md shadow-lg shadow-black/30 flex-shrink-0 object-cover bg-gray-700" />
                    <div className="flex-grow">
                        <h2 className="text-3xl font-bold text-white">{albumAnalysis.album}</h2>
                        <p className="text-xl text-gray-300">{albumAnalysis.artist}</p>
                        {albumAnalysis.year && (
                            <p className="text-md text-gray-400 mt-1">{albumAnalysis.year}{albumAnalysis.genre && ` · ${albumAnalysis.genre}`}</p>
                        )}
                    </div>
                </div>

                <div className="mt-6 border-t border-gray-700 pt-4">
                    <h3 className="flex items-center gap-2 font-bold text-lg text-blue-400 mb-3">
                        <MusicNoteIcon className="w-5 h-5"/>
                        Listen Now
                    </h3>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <a href={`https://music.youtube.com/search?q=${encodeURIComponent(`${albumAnalysis.artist} ${albumAnalysis.album}`)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition w-full sm:w-auto">
                            <YouTubeIcon className="w-5 h-5"/>
                            <span>YouTube Music</span>
                        </a>
                        <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`${albumAnalysis.artist} ${albumAnalysis.album}`)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition w-full sm:w-auto">
                            <YouTubeIcon className="w-5 h-5 text-red-500"/>
                            <span>YouTube</span>
                        </a>
                    </div>
                </div>

                {recommendation && meta && (
                    <div className={`text-center p-4 rounded-lg border ${meta.color} bg-opacity-50 mt-6 animate-fade-in`}>
                        <div className={`inline-flex items-center space-x-2 px-4 py-1.5 rounded-full text-md font-semibold`}>
                            {meta.icon}
                            <span>{meta.label}</span>
                        </div>
                        <p className="text-gray-300 leading-relaxed mt-3">{recommendation.rationale}</p>
                    </div>
                )}
                 {error && (
                    <div className="mt-6 bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-center">
                        <strong>Error loading details:</strong> {error}
                    </div>
                )}
            </div>
            
            {communityStats && (
              <div className="bg-gray-800/70 rounded-lg p-6 border border-gray-700 animate-fade-in">
                <h3 className="flex items-center gap-3 font-bold text-xl text-teal-300 mb-4 pb-2 border-b border-gray-700">
                  <CommunityIcon className="w-6 h-6" />
                  From the Community
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-white mb-2">Stats</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                          <StarRating rating={communityStats.averageRating} isDisplayOnly />
                          <span className="text-gray-300 font-semibold">{communityStats.averageRating.toFixed(1)}/5</span>
                          <span className="text-gray-400">({communityStats.ratingCount} ratings)</span>
                      </div>
                      <p className="text-gray-300"><span className="font-semibold text-white">{communityStats.ownerCount}</span> user(s) own this album.</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-2">Available for Trade</h4>
                    {communityStats.tradeOffers.length > 0 ? (
                        <ul className="space-y-2">
                            {communityStats.tradeOffers.map(({ user, album }) => (
                                <li key={user.id} className="flex items-center justify-between p-2 bg-gray-900/50 rounded-md">
                                    <div className="flex items-center gap-2">
                                        <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full"/>
                                        <div>
                                            <p className="text-sm font-semibold text-white">{user.name}</p>
                                            <p className="text-xs text-teal-300 font-mono">{album.condition}</p>
                                        </div>
                                    </div>
                                    <button onClick={onGoToTradeMatches} className="text-sm font-semibold text-teal-400 hover:text-teal-300">View</button>
                                </li>
                            ))}
                        </ul>
                    ) : <p className="text-sm text-gray-400">No public trade offers.</p>}
                  </div>
                  <div className="md:col-span-2">
                    <h4 className="font-semibold text-white mb-2">Recent Comments</h4>
                    {communityStats.comments.length > 0 ? (
                        <div className="space-y-3">
                          {communityStats.comments.map(c => (
                            <div key={c.timestamp} className="flex items-start gap-3">
                              <img src={c.user.avatarUrl} alt={c.user.name} className="w-8 h-8 rounded-full mt-1"/>
                              <div className="flex-1 bg-gray-900/50 p-2 rounded-md">
                                <p className="text-sm font-semibold text-white">{c.user.name}</p>
                                <p className="text-sm text-gray-300 italic">"{c.text}"</p>
                              </div>
                            </div>
                          ))}
                        </div>
                    ) : <p className="text-sm text-gray-400">No public comments yet.</p>}
                  </div>
                </div>
              </div>
            )}

            <div className="bg-gray-800/70 rounded-lg p-6 border border-gray-700 animate-fade-in">
                <h3 className="flex items-center gap-2 font-bold text-lg text-blue-400 mb-2">
                    <MusicNoteIcon className="w-5 h-5"/>
                    Suggested Tracks
                </h3>
                {albumAnalysis.tracklist === undefined ? (
                    <div className="flex items-center gap-3 text-gray-400 mt-3">
                        <Spinner className="w-5 h-5" />
                        <span>Finding notable tracks...</span>
                    </div>
                ) : albumAnalysis.tracklist.length > 0 ? (
                    <ul className="space-y-2 mt-3">
                        {albumAnalysis.tracklist.slice(0, 5).map(track => (
                            <li key={track.title} className="flex items-center justify-between p-2 pl-3 bg-gray-900/50 rounded-md animate-fade-in">
                                <span className="text-gray-200">{track.title}</span>
                                <a href={track.youtubeMusicUrl} target="_blank" rel="noopener noreferrer" title={`Listen to ${track.title} on YouTube Music`} className="text-gray-400 hover:text-white transition p-1">
                                    <YouTubeIcon className="w-6 h-6"/>
                                </a>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-400 italic mt-3">No suggested tracks found for this album.</p>
                )}
            </div>
            
            {(albumAnalysis.albumDescription === undefined && albumAnalysis.tracklist) &&
                <div className="bg-gray-800/70 rounded-lg p-6 border border-gray-700 animate-fade-in">
                    <div className="flex items-center gap-3 text-gray-400">
                        <Spinner className="w-5 h-5" />
                        <span>Compiling full analysis...</span>
                    </div>
                </div>
            }

            {albumAnalysis.albumDescription && (
                <div className="bg-gray-800/70 rounded-lg p-6 border border-gray-700 animate-fade-in">
                    <p className="text-gray-300 italic mb-6">{albumAnalysis.albumDescription}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="flex items-center gap-2 font-bold text-lg text-green-400 mb-2">
                                <ThumbsUpIcon className="w-5 h-5"/>
                                Buy This If...
                            </h3>
                            <ul className="list-disc list-inside space-y-1 text-green-200/90 text-sm">
                                {albumAnalysis.buyThisIf?.map((reason, i) => <li key={i}>{reason}</li>)}
                            </ul>
                        </div>
                        <div>
                            <h3 className="flex items-center gap-2 font-bold text-lg text-red-400 mb-2">
                                <ThumbsDownIcon className="w-5 h-5"/>
                                Avoid This If...
                            </h3>
                            <ul className="list-disc list-inside space-y-1 text-red-200/90 text-sm">
                                {albumAnalysis.avoidThisIf?.map((reason, i) => <li key={i}>{reason}</li>)}
                            </ul>
                        </div>
                    </div>

                    {albumAnalysis.notableFacts && albumAnalysis.notableFacts.length > 0 && (
                        <div className="mt-6">
                            <h3 className="flex items-center gap-2 font-bold text-lg text-yellow-400 mb-2">
                                <InfoIcon className="w-5 h-5"/>
                                Notable Facts
                            </h3>
                            <ul className="list-disc list-inside space-y-1 text-yellow-200/90 text-sm">
                                {albumAnalysis.notableFacts.map((fact, i) => <li key={i}>{fact}</li>)}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="font-semibold text-white text-center sm:text-left">What do you want to do?</p>
                <div className="flex gap-3 flex-shrink-0">
                    <button
                        onClick={() => onInitiateAddToCollection(albumAnalysis as AlbumAnalysisResult, previewUrl || undefined)}
                        disabled={isAlreadyInCollection || !albumAnalysis.albumDescription}
                        className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded-lg transition disabled:bg-green-800/50 disabled:border-green-600 disabled:text-green-300 disabled:cursor-not-allowed"
                    >
                        {isAlreadyInCollection ? 'In Collection' : 'I Bought It!'}
                    </button>
                    <button
                        onClick={onAddToWishlist}
                        disabled={isAlreadyInWishlist || isAlreadyInCollection || hasAddedToWishlist}
                        className="inline-flex items-center gap-2 bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition disabled:bg-blue-800/50 disabled:border-blue-600 disabled:text-blue-300 disabled:cursor-not-allowed"
                    >
                        <AddIcon className="w-5 h-5"/>
                        {isAlreadyInWishlist ? 'In Wishlist' : (hasAddedToWishlist ? 'Added!' : 'Add to Wishlist')}
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default AlbumScanner;