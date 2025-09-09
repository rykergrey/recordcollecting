import React, { useState } from 'react';
import type { CollectionAlbumInfo, User, OfferedAlbum } from '../types';

interface ProposeTradeModalProps {
  currentUser: User;
  toUser: User;
  wantedAlbum: CollectionAlbumInfo;
  myTradeList: CollectionAlbumInfo[];
  onClose: () => void;
  onSendOffer: (offer: { toUser: User; wantedAlbum: CollectionAlbumInfo; offeredAlbums: OfferedAlbum[] }) => void;
}

const ProposeTradeModal: React.FC<ProposeTradeModalProps> = ({ toUser, wantedAlbum, myTradeList, onClose, onSendOffer }) => {
  const [selectedAlbumIds, setSelectedAlbumIds] = useState<Set<string>>(new Set());
  const getAlbumId = (album: { artist: string; album: string; }) => `${album.artist}-${album.album}`;

  const handleToggleSelection = (albumId: string) => {
    setSelectedAlbumIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(albumId)) {
        newSet.delete(albumId);
      } else {
        newSet.add(albumId);
      }
      return newSet;
    });
  };

  const handleSend = () => {
    const offeredAlbums = myTradeList
      .filter(album => selectedAlbumIds.has(getAlbumId(album)))
      .map(album => ({ ...album, condition: album.condition! }));
    
    if (offeredAlbums.length === 0) {
        alert("Please select at least one album to offer.");
        return;
    }

    onSendOffer({ toUser, wantedAlbum, offeredAlbums });
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="bg-gray-800 rounded-xl border border-gray-700 shadow-2xl shadow-black/50 w-full max-w-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-700">
          <h2 id="modal-title" className="text-2xl font-bold text-white">Propose Trade</h2>
          <p className="text-gray-400">Send an offer to {toUser.name}</p>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Wanted Album */}
                <div className="text-center">
                    <h3 className="font-semibold text-lg text-white mb-2">You Want:</h3>
                    <div className="p-3 bg-gray-900 rounded-lg border border-teal-500/50">
                        <img src={wantedAlbum.coverArtUrls[0]} alt={wantedAlbum.album} className="w-40 h-40 mx-auto rounded-md shadow-lg"/>
                        <p className="font-bold mt-2">{wantedAlbum.album}</p>
                        <p className="text-sm text-gray-400">{wantedAlbum.artist}</p>
                    </div>
                </div>

                {/* Offer Albums */}
                <div>
                     <h3 className="font-semibold text-lg text-white mb-2 text-center">You Offer:</h3>
                     {myTradeList.length > 0 ? (
                        <div className="space-y-2">
                            {myTradeList.map(album => {
                                const albumId = getAlbumId(album);
                                const isSelected = selectedAlbumIds.has(albumId);
                                return (
                                    <button 
                                        key={albumId}
                                        onClick={() => handleToggleSelection(albumId)}
                                        className={`w-full flex items-center gap-3 p-2 rounded-lg border-2 text-left transition ${isSelected ? 'bg-teal-500/20 border-teal-500' : 'bg-gray-700 border-transparent hover:border-gray-500'}`}
                                    >
                                        <img src={album.coverArtUrls[0]} alt={album.album} className="w-12 h-12 rounded-md shrink-0"/>
                                        <div className="flex-1">
                                            <p className="font-semibold text-white truncate">{album.album}</p>
                                            <p className="text-xs text-gray-300">{album.artist}</p>
                                            <p className="text-xs text-teal-300 font-mono">{album.condition}</p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                     ) : (
                        <p className="text-gray-400 text-center p-4 bg-gray-900 rounded-lg">You have no items in your trade list.</p>
                     )}
                </div>

            </div>
        </div>
        
        <div className="p-6 border-t border-gray-700 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition">
            Cancel
          </button>
          <button type="button" onClick={handleSend} disabled={selectedAlbumIds.size === 0} className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded-lg transition disabled:bg-gray-500 disabled:cursor-not-allowed">
            Send Offer
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProposeTradeModal;
