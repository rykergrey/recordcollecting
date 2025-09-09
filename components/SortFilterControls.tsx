import React from 'react';

interface SortFilterControlsProps {
  sortKey: string;
  setSortKey: (key: any) => void;
  sortOrder: string;
  setSortOrder: (order: any) => void;
  filterGenre: string;
  setFilterGenre: (genre: string) => void;
  filterDecade: string;
  setFilterDecade: (decade: string) => void;
  filterStore: string;
  setFilterStore: (store: string) => void;
  genres: string[];
  decades: string[];
  stores: string[];
}

const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }> = ({ children, ...props }) => (
    <select {...props} className="bg-gray-700 text-white text-sm rounded-md px-3 py-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500 transition">
        {children}
    </select>
);

const SortFilterControls: React.FC<SortFilterControlsProps> = (props) => {
  const {
    sortKey, setSortKey, sortOrder, setSortOrder,
    filterGenre, setFilterGenre, filterDecade, setFilterDecade, filterStore, setFilterStore,
    genres, decades, stores
  } = props;

  return (
    <div className="flex flex-wrap gap-2 items-center">
        <Select value={`${sortKey}-${sortOrder}`} onChange={e => {
            const [key, order] = e.target.value.split('-');
            setSortKey(key);
            setSortOrder(order);
        }}>
            <option value="artist-asc">Artist A-Z</option>
            <option value="artist-desc">Artist Z-A</option>
            <option value="album-asc">Album A-Z</option>
            <option value="album-desc">Album Z-A</option>
            <option value="year-desc">Year (Newest)</option>
            <option value="year-asc">Year (Oldest)</option>
            <option value="rating-desc">Rating (Highest)</option>
            <option value="rating-asc">Rating (Lowest)</option>
        </Select>

       <Select value={filterGenre} onChange={e => setFilterGenre(e.target.value)}>
        <option value="">All Genres</option>
        {genres.map(g => <option key={g} value={g}>{g}</option>)}
      </Select>

      <Select value={filterDecade} onChange={e => setFilterDecade(e.target.value)}>
        <option value="">All Decades</option>
        {decades.map(d => <option key={d} value={d}>{d}</option>)}
      </Select>
      
       <Select value={filterStore} onChange={e => setFilterStore(e.target.value)}>
        <option value="">All Stores</option>
        {stores.map(s => <option key={s} value={s}>{s}</option>)}
      </Select>
    </div>
  );
};

export default SortFilterControls;
