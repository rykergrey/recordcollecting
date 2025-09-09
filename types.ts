
export enum AdviceLevel {
  SKIP = 'SKIP',
  CONSIDER = 'CONSIDER',
  BUY = 'BUY',
  MUST_BUY = 'MUST_BUY',
}

// For wishlist items
export interface AlbumInfo {
  artist: string;
  album: string;
  coverArtUrl?: string;
  priority?: 'High' | 'Medium' | 'Low';
}

export interface TrackInfo {
  title: string;
  description: string;
  ratings: Record<string, number>; // User's rating for the track, keyed by userId
  youtubeMusicUrl: string;
}

export interface YouTubeLink {
  title: string;
  url: string;
}

export interface Comment {
  text: string;
  timestamp: string; // ISO 8601 format
}

export interface Provenance {
  type: 'purchase' | 'trade';
  from: string; // Store name or User name
  date: string; // ISO Date
  price?: number;
  withUser?: Pick<User, 'id' | 'name'>; // if type is trade
}

export type AlbumCondition = 'Mint (M)' | 'Near Mint (NM)' | 'Very Good Plus (VG+)' | 'Very Good (VG)' | 'Good Plus (G+)' | 'Good (G)' | 'Fair (F)' | 'Poor (P)';

// The result from the album analysis
export interface AlbumAnalysisResult {
  artist: string;
  album: string;
  year: number;
  genre: string;
  coverArtUrls: string[];
  
  // Rykersoft-generated rich data
  albumDescription: string;
  buyThisIf: string[];
  avoidThisIf: string[];
  notableFacts: string[];
  personalRecommendation?: string; // Now optional and generated on-demand
  historicalSignificance: string;
  musicalStyle: string;
  legacy: string;
  tracklist: Omit<TrackInfo, 'ratings'>[]; // Ratings are user-provided
  youtubeLinks: YouTubeLink[];
}

// Full, detailed object for an album in the user's collection
export interface CollectionAlbumInfo extends AlbumAnalysisResult {
  provenance: Provenance[];
  
  // User's personal ratings and notes, keyed by userId
  ratings: Record<string, number>; 
  userComments: Record<string, Comment[]>;
  tracklist: TrackInfo[]; // Tracklist now includes user ratings

  // Social & Trade features
  isPublic?: boolean; // User can hide specific albums
  forTrade?: boolean;
  condition?: AlbumCondition;
}

export interface ArtistAlbumSearchResult {
    artist: string;
    album: string;
    year: number;
}

// --- Social Features Types ---

export interface User {
  id: string;
  name: string;
  avatarUrl: string;
  collection: CollectionAlbumInfo[];
  wishlist: AlbumInfo[];
  tradeList: CollectionAlbumInfo[];
  followedUserIds: string[];
  sharedLibraryWith?: string[];
  libraryShareRequests?: Record<string, 'sent' | 'received'>;
}

export enum ActivityType {
  NEW_ALBUM = 'NEW_ALBUM',
  NEW_WISHLIST = 'NEW_WISHLIST',
  NEW_TRADELIST = 'NEW_TRADELIST',
  NEW_RATING = 'NEW_RATING',
  NEW_COMMENT = 'NEW_COMMENT',
  NEW_REVIEW = 'NEW_REVIEW',
  NEW_TRADE_OFFER = 'NEW_TRADE_OFFER',
  TRADE_ACCEPTED = 'TRADE_ACCEPTED',
}

export interface ActivityEvent {
  id: string;
  user: Pick<User, 'id' | 'name' | 'avatarUrl'>;
  type: ActivityType;
  album: {
    artist: string;
    album: string;
    coverArtUrl: string;
  };
  details?: {
    rating?: number;
    comment?: string;
    review?: string;
    tradeOffer?: TradeOffer;
  };
  timestamp: string; // ISO 8601
}

// --- Trade Types ---

export interface OfferedAlbum extends CollectionAlbumInfo {
  condition: AlbumCondition;
}

export interface TradeOffer {
  id: string;
  fromUser: Pick<User, 'id' | 'name' | 'avatarUrl'>;
  toUser: Pick<User, 'id' | 'name' | 'avatarUrl'>;
  wantedAlbum: CollectionAlbumInfo;
  offeredAlbums: OfferedAlbum[];
  status: 'pending' | 'accepted' | 'rejected';
  timestamp: string;
}
