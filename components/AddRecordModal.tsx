import React, { useState, useRef, useMemo } from 'react';
import * as api from '../services/apiService';

import { Spinner } from './Spinner';
import { SearchIcon } from './icons/SearchIcon';
import { ScanIcon } from './icons/ScanIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { UploadIcon } from './icons/UploadIcon';
import { AddIcon } from './icons/AddIcon';
import { CheckIcon } from './icons/CheckIcon';
import { CloseIcon } from './icons/CloseIcon';
import type { AlbumAnalysisResult, ArtistAlbumSearchResult, CollectionAlbumInfo } from '../types';

type AddMode = 'search' | 'scan' | 'bulk';
type ParsedAlbum = { artist: string; album: string; };

interface AddRecordModalProps {
    collection: CollectionAlbumInfo[];
    onClose: () => void;
    onAddSuccess: () => void;
    onInitiateAddToCollection: (analysis: AlbumAnalysisResult, userImage?: string) => void;
}

const getAlbumId = (album: { artist: string; album: string; }) => `${album.artist}-${album.album}`.toLowerCase().replace(/\s/g, '-');

const AddRecordModal: React.FC<AddRecordModalProps> = ({ collection, onClose, onAddSuccess, onInitiateAddToCollection }) => {
    const [activeTab, setActiveTab] = useState<AddMode>('search');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingStep, setLoadingStep] = useState('');
    const [error, setError] = useState<string | null>(null);

    // Search state
    const [query, setQuery] = useState('');
    const [searchResults, setSearchResults] = useState<ArtistAlbumSearchResult[]>([]);

    // Scan state
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [base64Image, setBase64Image] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Bulk add state
    const [bulkText, setBulkText] = useState('');
    const [bulkResults, setBulkResults] = useState<ParsedAlbum[]>([]);
    const [selectedBulkAlbums, setSelectedBulkAlbums] = useState<Set<string>>(new Set());
    const [bulkAddProgress, setBulkAddProgress] = useState<{ current: number, total: number, message: string } | null>(null);

    const [albumAnalysis, setAlbumAnalysis] = useState<Partial<AlbumAnalysisResult> | null>(null);
    const isAlreadyInCollection = useMemo(() => {
        if (!albumAnalysis?.artist || !albumAnalysis?.album) return false;
        const albumId = getAlbumId(albumAnalysis as ParsedAlbum);
        return collection.some(item => getAlbumId(item) === albumId);
    }, [albumAnalysis, collection]);

    const resetState = () => {
        setIsLoading(false);
        setLoadingStep('');
        setError(null);
        setQuery('');
        setSearchResults([]);
        setPreviewUrl(null);
        setBase64Image(null);
        setBulkText('');
        setBulkResults([]);
        setSelectedBulkAlbums(new Set());
        setAlbumAnalysis(null);
        setBulkAddProgress(null);
    };

    const handleTabChange = (tab: AddMode) => {
        resetState();
        setActiveTab(tab);
    }
    
    // --- Single Add Logic (Search/Scan) ---
    const fetchDetailsForAlbum = async (selectedAlbum: ParsedAlbum) => {
        setIsLoading(true);
        setLoadingStep(`Fetching details for ${selectedAlbum.album}...`);
        setError(null);
        setAlbumAnalysis(null);
        setSearchResults([]);
        
        try {
            const analysis = await api.getFullAlbumAnalysis(selectedAlbum);
            const tracks = await api.getSuggestedTracks(selectedAlbum);
            setAlbumAnalysis({ ...selectedAlbum, ...analysis, tracklist: tracks });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not fetch album details.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleTextSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;
        setIsLoading(true);
        setLoadingStep(`Searching for "${query}"...`);
        setError(null);
        setSearchResults([]);
        setAlbumAnalysis(null);
        try {
            const results = await api.searchAlbumsByArtist(query);
            if (results.length === 1) {
                await fetchDetailsForAlbum(results[0]);
            } else if (results.length > 1) {
                setSearchResults(results);
            } else {
                setError(`No results found for "${query}".`);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred during search.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const url = reader.result as string;
                setPreviewUrl(url);
                setBase64Image(url.split(',')[1]);
                handleScan(url.split(',')[1], file.type);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleScan = async (base64: string, mimeType: string) => {
        setIsLoading(true);
        setLoadingStep('Identifying album...');
        setError(null);
        setAlbumAnalysis(null);
        try {
            const identifiedAlbum = await api.identifyAlbumFromImage(base64, mimeType);
            await fetchDetailsForAlbum(identifiedAlbum);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not identify album from image.');
        } finally {
            setIsLoading(false);
        }
    };
    
    // --- Bulk Add Logic ---
    
    const handleBulkParse = async () => {
        if (!bulkText.trim()) return;
        setIsLoading(true);
        setLoadingStep('Analyzing your list with Gemini...');
        setError(null);
        setBulkResults([]);
        try {
            const albums = await api.parseAlbumsFromText(bulkText);
            setBulkResults(albums);
            setSelectedBulkAlbums(new Set(albums.map(getAlbumId)));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not parse the list.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleBulkSelection = (albumId: string) => {
        setSelectedBulkAlbums(prev => {
            const newSet = new Set(prev);
            if (newSet.has(albumId)) newSet.delete(albumId);
            else newSet.add(albumId);
            return newSet;
        });
    };
    
    const handleConfirmBulkAdd = async () => {
        const albumsToAdd = bulkResults.filter(album => selectedBulkAlbums.has(getAlbumId(album)))
            .filter(album => !collection.some(c => getAlbumId(c) === getAlbumId(album)));
        
        if (albumsToAdd.length === 0) {
            setError("No new albums selected to add.");
            return;
        }

        setIsLoading(true);
        setBulkAddProgress({ current: 0, total: albumsToAdd.length, message: "Starting..." });

        for (let i = 0; i < albumsToAdd.length; i++) {
            const album = albumsToAdd[i];
            try {
                setBulkAddProgress({ current: i + 1, total: albumsToAdd.length, message: `Adding ${album.album}...` });
                const analysis = await api.getFullAlbumAnalysis(album);
                const tracks = await api.getSuggestedTracks(album);
                const fullAnalysis = { ...album, ...analysis, tracklist: tracks };
                await api.addToCollection(fullAnalysis as AlbumAnalysisResult, { price: 0, store: 'Bulk Add' });
            } catch (err) {
                console.error(`Failed to add ${album.album}:`, err);
                // Optionally update UI to show which ones failed
            }
        }
        
        setBulkAddProgress({ current: albumsToAdd.length, total: albumsToAdd.length, message: "Finished!" });
        onAddSuccess(); // This will close the modal and reload data
    };
    
    const renderContent = () => {
        if (isLoading && !bulkAddProgress) {
             return (
                <div className="text-center py-8 flex flex-col items-center justify-center gap-4 text-gray-300">
                    <Spinner className="w-10 h-10 text-teal-400" />
                    <p className="font-medium text-lg animate-pulse">{loadingStep}</p>
                </div>
            );
        }
        
        if (bulkAddProgress) {
            const percentage = (bulkAddProgress.current / bulkAddProgress.total) * 100;
            return (
                 <div className="text-center py-8 px-4">
                    <h3 className="text-xl font-bold text-white">Adding Albums...</h3>
                    <p className="text-gray-400 mt-2">{bulkAddProgress.message}</p>
                    <div className="w-full bg-gray-700 rounded-full h-4 my-4">
                        <div className="bg-teal-500 h-4 rounded-full" style={{ width: `${percentage}%` }}></div>
                    </div>
                    <p className="font-semibold">{bulkAddProgress.current} / {bulkAddProgress.total}</p>
                </div>
            )
        }
        
        if (error) {
            return <div className="my-6 bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-center"><strong>Error:</strong> {error}</div>;
        }

        // Single album results (from search or scan)
        if (albumAnalysis?.album) {
            return (
                <div className="p-4 space-y-4">
                    <div className="flex gap-4 p-3 bg-gray-700/50 rounded-lg">
                        <img src={(albumAnalysis.coverArtUrls && albumAnalysis.coverArtUrls[0]) || previewUrl || ''} alt={albumAnalysis.album} className="w-24 h-24 rounded-md" />
                        <div>
                            <h3 className="font-bold text-xl text-white">{albumAnalysis.album}</h3>
                            <p className="text-gray-300">{albumAnalysis.artist}</p>
                            <p className="text-sm text-gray-400">{albumAnalysis.year}</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => onInitiateAddToCollection(albumAnalysis as AlbumAnalysisResult, previewUrl || undefined)}
                        disabled={isAlreadyInCollection}
                        className="w-full inline-flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded-lg transition disabled:bg-green-800 disabled:text-green-300 disabled:cursor-not-allowed"
                    >
                        {isAlreadyInCollection ? <><CheckIcon className="w-5 h-5"/> In Collection</> : <><AddIcon className="w-5 h-5"/> Add to Collection</>}
                    </button>
                    <button onClick={resetState} className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition">Back</button>
                </div>
            );
        }

        // Search results
        if (searchResults.length > 0) {
            return (
                <div className="p-4 space-y-2">
                    <h3 className="font-semibold text-lg text-center mb-2">Did you mean...?</h3>
                    {searchResults.map(result => (
                        <button key={getAlbumId(result)} onClick={() => fetchDetailsForAlbum(result)} className="w-full text-left p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition">
                            <span className="font-bold">{result.album}</span> <span className="text-gray-400">by {result.artist} ({result.year})</span>
                        </button>
                    ))}
                    <button onClick={resetState} className="w-full mt-2 bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition">Back</button>
                </div>
            );
        }
        
        // Bulk results
        if (bulkResults.length > 0) {
            return (
                <div className="p-4 space-y-4">
                    <h3 className="font-semibold text-lg text-white">We found {bulkResults.length} album(s).</h3>
                    <p className="text-sm text-gray-400">Select the albums you want to add. Records already in your collection are disabled.</p>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                        {bulkResults.map(album => {
                            const albumId = getAlbumId(album);
                            const inCollection = collection.some(c => getAlbumId(c) === albumId);
                            const isSelected = selectedBulkAlbums.has(albumId);
                            return (
                                <label key={albumId} className={`flex items-center gap-3 p-2 rounded-lg border-2 text-left transition ${ inCollection ? 'bg-gray-700/50 border-transparent text-gray-500' : isSelected ? 'bg-teal-500/20 border-teal-500 cursor-pointer' : 'bg-gray-700 border-transparent hover:border-gray-500 cursor-pointer'}`}>
                                    <input type="checkbox" checked={isSelected && !inCollection} disabled={inCollection} onChange={() => handleToggleBulkSelection(albumId)} className="w-5 h-5 bg-gray-600 border-gray-500 rounded text-teal-500 focus:ring-teal-600" />
                                    <div>
                                        <p className="font-semibold text-white">{album.album}</p>
                                        <p className="text-sm">{album.artist}</p>
                                    </div>
                                    {inCollection && <span className="ml-auto text-xs font-bold text-green-400">IN COLLECTION</span>}
                                </label>
                            );
                        })}
                    </div>
                    <button onClick={handleConfirmBulkAdd} disabled={selectedBulkAlbums.size === 0} className="w-full inline-flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded-lg transition disabled:bg-gray-500">
                        Add Selected ({Array.from(selectedBulkAlbums).filter(id => !collection.some(c => getAlbumId(c) === id)).length})
                    </button>
                </div>
            );
        }

        // Default tab inputs
        switch(activeTab) {
            case 'search': return (
                <div className="p-4">
                    <form onSubmit={handleTextSearch} className="flex gap-2">
                        <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="e.g., Pink Floyd - Dark Side..." className="flex-grow bg-gray-700 text-white placeholder-gray-400 rounded-lg px-4 py-3 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500" autoFocus />
                        <button type="submit" className="inline-flex items-center justify-center p-3 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-lg transition"><SearchIcon className="w-5 h-5" /></button>
                    </form>
                </div>
            );
            case 'scan': return (
                <div className="p-4 text-center">
                    <button onClick={() => fileInputRef.current?.click()} className="w-full inline-flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105">
                        <UploadIcon className="w-5 h-5" />
                        Upload Album Cover
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/png, image/jpeg, image/webp"/>
                </div>
            );
            case 'bulk': return (
                <div className="p-4 space-y-3">
                    <textarea value={bulkText} onChange={e => setBulkText(e.target.value)} rows={5} className="w-full bg-gray-700 text-white rounded-lg p-3 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="e.g., Andrew WK's I Get Wet and God is Partying, and Meatloaf's Bat Out of Hell 1 and 2..." />
                    <button onClick={handleBulkParse} className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded-lg transition">Analyze List</button>
                </div>
            );
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-2xl shadow-black/50 w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h2 id="modal-title" className="text-xl font-bold text-white">Add Records to Collection</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><CloseIcon className="w-6 h-6"/></button>
                </div>
                
                <div className="flex border-b border-gray-700">
                    <TabButton icon={<SearchIcon />} label="Search" isActive={activeTab === 'search'} onClick={() => handleTabChange('search')} />
                    <TabButton icon={<ScanIcon />} label="Scan" isActive={activeTab === 'scan'} onClick={() => handleTabChange('scan')} />
                    <TabButton icon={<DocumentTextIcon />} label="Bulk Add" isActive={activeTab === 'bulk'} onClick={() => handleTabChange('bulk')} />
                </div>
                
                <div>{renderContent()}</div>
            </div>
        </div>
    );
};

// FIX: Correctly type the 'icon' prop for the local TabButton component to allow passing a 'className' prop via React.cloneElement, resolving a TypeScript error.
const TabButton: React.FC<{ icon: React.ReactElement<{ className?: string }>, label: string, isActive: boolean, onClick: () => void }> = ({ icon, label, isActive, onClick }) => (
    <button onClick={onClick} className={`flex-1 p-3 font-semibold flex items-center justify-center gap-2 transition text-sm ${isActive ? 'bg-gray-700/50 text-teal-400' : 'text-gray-400 hover:bg-gray-700/25'}`}>
        {React.cloneElement(icon, { className: 'w-5 h-5' })}
        {label}
    </button>
);


export default AddRecordModal;
