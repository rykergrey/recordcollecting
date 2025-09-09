import React, { useState } from 'react';
import type { AlbumAnalysisResult } from '../types';
import { RecordIcon } from './icons/RecordIcon';

interface AddToCollectionModalProps {
  albumInfo: AlbumAnalysisResult;
  coverArtUrl: string;
  stores: string[];
  onClose: () => void;
  onSave: (details: { price: number; store: string }) => void;
}

const AddToCollectionModal: React.FC<AddToCollectionModalProps> = ({ albumInfo, coverArtUrl, stores, onClose, onSave }) => {
  const [price, setPrice] = useState('');
  const [store, setStore] = useState('');
  const [error, setError] = useState('');

  const handleSave = () => {
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setError('Please enter a valid price.');
      return;
    }
    if (!store.trim()) {
      setError('Please enter a store name.');
      return;
    }
    onSave({ price: parsedPrice, store: store.trim() });
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
        className="bg-gray-800 rounded-xl border border-gray-700 shadow-2xl shadow-black/50 w-full max-w-md"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-700">
            <h2 id="modal-title" className="text-2xl font-bold text-white">Add to Collection</h2>
            <p className="text-gray-400">Log the details of your new purchase.</p>
        </div>

        <div className="p-6">
            <div className="flex gap-4 items-center mb-6">
                <div className="flex-shrink-0 w-24 h-24 bg-gray-700 rounded-lg overflow-hidden">
                {coverArtUrl ? (
                    <img src={coverArtUrl} alt={albumInfo.album} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <RecordIcon className="w-12 h-12 text-gray-500" />
                    </div>
                )}
                </div>
                <div>
                    <p className="text-lg font-bold text-white">{albumInfo.album}</p>
                    <p className="text-gray-300">{albumInfo.artist}</p>
                    <p className="text-sm text-gray-400">{albumInfo.year} &middot; {albumInfo.genre}</p>
                </div>
            </div>

            <form onSubmit={e => { e.preventDefault(); handleSave(); }}>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="price" className="block text-sm font-medium text-gray-300 mb-1">Price Paid</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">$</span>
                            <input
                                type="number"
                                id="price"
                                value={price}
                                onChange={e => setPrice(e.target.value)}
                                className="w-full bg-gray-700 text-white rounded-lg pl-7 pr-4 py-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                placeholder="25.99"
                                step="0.01"
                                autoFocus
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="store" className="block text-sm font-medium text-gray-300 mb-1">Purchased From</label>
                         <input
                            type="text"
                            id="store"
                            list="store-list"
                            value={store}
                            onChange={e => setStore(e.target.value)}
                            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500"
                            placeholder="e.g., Vintage Vinyl"
                        />
                        <datalist id="store-list">
                            {stores.map(s => <option key={s} value={s} />)}
                        </datalist>
                    </div>
                </div>

                 {error && <p className="text-red-400 text-sm mt-4 text-center">{error}</p>}
                
                <div className="mt-8 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition">
                        Cancel
                    </button>
                    <button type="submit" className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded-lg transition">
                        Save to Collection
                    </button>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
};

export default AddToCollectionModal;
