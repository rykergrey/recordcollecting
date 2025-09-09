// FIX: Changed 'import type' to a regular 'import' for 'ActivityType' because it is an enum used as a value.
import { type User, type ActivityEvent, ActivityType, type CollectionAlbumInfo } from '../types';

const MOCK_COLLECTION_1: CollectionAlbumInfo[] = [
  {
    artist: 'Fleetwood Mac', album: 'Rumours', coverArtUrls: ['https://upload.wikimedia.org/wikipedia/en/f/fb/FMacRumours.png'], year: 1977, genre: 'Soft Rock',
    provenance: [{ type: 'purchase', from: 'Vintage Vinyl', date: '2023-05-15', price: 25.99 }],
    rating: 5, isPublic: true, forTrade: false,
    albumDescription: "A blockbuster album born from intense personal turmoil, Rumours is a masterpiece of soft rock, featuring impeccable songwriting and layered vocal harmonies.",
    historicalSignificance: "One of the best-selling albums of all time, its success cemented Fleetwood Mac as superstars and defined the sound of late '70s radio.",
    musicalStyle: "A polished blend of pop, rock, and folk with a distinct Californian sound.",
    legacy: "Its raw emotional honesty, combined with commercial success, has made it a timeless classic.",
    buyThisIf: [], avoidThisIf: [], notableFacts: [], personalRecommendation: "",
    tracklist: [
      { title: 'Go Your Own Way', description: "A driving and bitter breakup anthem from Lindsey Buckingham.", rating: 5, youtubeMusicUrl: "https://music.youtube.com/search?q=Fleetwood+Mac+Go+Your+Own+Way" },
      { title: 'Dreams', description: "Stevie Nicks' iconic, ethereal response to the breakup.", rating: 5, youtubeMusicUrl: "https://music.youtube.com/search?q=Fleetwood+Mac+Dreams" },
    ],
    youtubeLinks: [],
    comments: [{ text: "First listen, absolutely blown away.", timestamp: "2024-07-21T19:30:00Z" }]
  },
  {
    artist: 'Kendrick Lamar', album: 'To Pimp a Butterfly', coverArtUrls: ['https://upload.wikimedia.org/wikipedia/en/f/f6/Kendrick_Lamar_-_To_Pimp_a_Butterfly.png'], year: 2015, genre: 'Conscious Hip Hop',
    provenance: [{ type: 'purchase', from: 'Vintage Vinyl', date: '2023-02-10', price: 28.00 }],
    rating: 5, isPublic: true, forTrade: false,
    albumDescription: "A dense and ambitious album that weaves together jazz, funk, and soul to explore themes of race, identity, and black culture in America.",
    historicalSignificance: "Released during a time of heightened racial tension, 'Alright' became an anthem for the Black Lives Matter movement.",
    musicalStyle: "Experimental hip-hop featuring live instrumentation from luminaries like Thundercat and Terrace Martin.",
    legacy: "Praised for its lyrical depth and musical complexity, it expanded the boundaries of what a mainstream hip-hop album could be.",
    buyThisIf: [], avoidThisIf: [], notableFacts: [], personalRecommendation: "",
    tracklist: [
      { title: 'King Kunta', description: "A defiant, funky track addressing his critics.", rating: 5, youtubeMusicUrl: "https://music.youtube.com/search?q=Kendrick+Lamar+King+Kunta" },
      { title: 'Alright', description: "An anthem of hope and resilience in the face of police brutality.", rating: 5, youtubeMusicUrl: "https://music.youtube.com/search?q=Kendrick+Lamar+Alright" },
    ],
    youtubeLinks: [],
    comments: []
  },
];

const MOCK_COLLECTION_2: CollectionAlbumInfo[] = [
  {
    artist: 'Pink Floyd', album: 'The Dark Side of the Moon', coverArtUrls: ['https://upload.wikimedia.org/wikipedia/en/3/3b/Dark_Side_of_the_Moon.png'], year: 1973, genre: 'Progressive Rock',
    provenance: [{ type: 'purchase', from: 'Groove Records', date: '2024-01-20', price: 30.00 }],
    rating: 4, isPublic: true, forTrade: true, condition: 'Very Good Plus (VG+)',
    albumDescription: "A concept album exploring themes of conflict, greed, time, and mental illness, renowned for its philosophical lyrics and complex instrumentation.",
    historicalSignificance: "One of the most commercially successful and critically acclaimed albums ever, it remained on the Billboard charts for over 14 years.",
    musicalStyle: "Psychedelic and progressive rock featuring extended instrumental passages, tape loops, and analog synthesizers.",
    legacy: "Its iconic cover and ambitious themes have made it a cultural touchstone, influencing generations of musicians.",
    buyThisIf: [], avoidThisIf: [], notableFacts: [], personalRecommendation: "",
    tracklist: [ { title: 'Money', description: 'Famous for its unusual time signature and cash register sound effects.', rating: 5, youtubeMusicUrl: "" }, { title: 'Time', description: 'Features a dramatic introduction of ticking clocks.', rating: 5, youtubeMusicUrl: "" }],
    youtubeLinks: [], comments: [{ text: 'A true masterpiece.', timestamp: '2024-07-20T10:00:00Z' }]
  },
  {
    artist: 'Fleetwood Mac', album: 'Rumours', coverArtUrls: ['https://upload.wikimedia.org/wikipedia/en/f/fb/FMacRumours.png'], year: 1977, genre: 'Soft Rock',
    provenance: [{ type: 'purchase', from: 'Electric Sounds', date: '2024-03-10', price: 22.50 }],
    rating: 4, isPublic: true, forTrade: true, condition: 'Very Good Plus (VG+)',
    albumDescription: "A blockbuster album born from intense personal turmoil, Rumours is a masterpiece of soft rock, featuring impeccable songwriting and layered vocal harmonies.",
    historicalSignificance: "One of the best-selling albums of all time, its success cemented Fleetwood Mac as superstars and defined the sound of late '70s radio.",
    musicalStyle: "A polished blend of pop, rock, and folk with a distinct Californian sound.",
    legacy: "Its raw emotional honesty, combined with commercial success, has made it a timeless classic.",
    buyThisIf: [], avoidThisIf: [], notableFacts: [], personalRecommendation: "",
    tracklist: [
      { title: 'Go Your Own Way', description: "A driving and bitter breakup anthem from Lindsey Buckingham.", rating: 4, youtubeMusicUrl: "https://music.youtube.com/search?q=Fleetwood+Mac+Go+Your+Own+Way" },
      { title: 'Dreams', description: "Stevie Nicks' iconic, ethereal response to the breakup.", rating: 5, youtubeMusicUrl: "https://music.youtube.com/search?q=Fleetwood+Mac+Dreams" },
    ],
    youtubeLinks: [],
    comments: [{ text: "Such a classic album, never gets old.", timestamp: "2024-07-22T12:00:00Z" }]
  }
];

export const currentUserData: User = {
    id: 'user-1',
    name: 'Alex Doe',
    avatarUrl: `https://i.pravatar.cc/150?u=user-1`,
    collection: MOCK_COLLECTION_1,
    wishlist: [
        { artist: 'Radiohead', album: 'OK Computer', coverArtUrl: 'https://upload.wikimedia.org/wikipedia/en/b/ba/Radioheadokcomputer.png', priority: 'High' },
        { artist: 'David Bowie', album: 'The Rise and Fall of Ziggy Stardust and the Spiders from Mars', coverArtUrl: 'https://upload.wikimedia.org/wikipedia/en/0/01/ZiggyStardust.jpg', priority: 'Medium' },
    ],
    tradeList: [
        {
            artist: 'Massive Attack', album: 'Mezzanine', coverArtUrls: ['https://upload.wikimedia.org/wikipedia/en/8/85/Massive_Attack_-_Mezzanine.png'], year: 1998, genre: 'Trip Hop',
            provenance: [{ type: 'purchase', from: 'Electric Sounds', date: '2022-11-05', price: 22.00 }],
            rating: 4, isPublic: true, forTrade: true, condition: 'Very Good (VG)',
            albumDescription: "A dark, atmospheric, and influential album that defined the trip-hop genre.",
            historicalSignificance: "", musicalStyle: "", legacy: "", buyThisIf: [], avoidThisIf: [], notableFacts: [], personalRecommendation: "", tracklist: [], youtubeLinks: [], comments: []
        }
    ],
    followedUserIds: ['user-2'],
};

export const allUsersData: User[] = [
    currentUserData,
    {
        id: 'user-2',
        name: 'Jane Doe',
        avatarUrl: `https://i.pravatar.cc/150?u=user-2`,
        collection: MOCK_COLLECTION_2,
        wishlist: [
            { artist: 'Fleetwood Mac', album: 'Rumours', coverArtUrl: 'https://upload.wikimedia.org/wikipedia/en/f/fb/FMacRumours.png', priority: 'Medium' }
        ],
        tradeList: [
            {
                artist: 'Radiohead', album: 'OK Computer', coverArtUrls: ['https://upload.wikimedia.org/wikipedia/en/b/ba/Radioheadokcomputer.png'], year: 1997, genre: 'Alternative Rock',
                provenance: [{ type: 'purchase', from: 'Vintage Vinyl', date: '2023-08-19', price: 29.99 }],
                rating: 5, isPublic: true, forTrade: true, condition: 'Near Mint (NM)',
                albumDescription: "A seminal album exploring themes of consumerism, globalization, and anti-modernism.",
                historicalSignificance: "", musicalStyle: "", legacy: "", buyThisIf: [], avoidThisIf: [], notableFacts: [], personalRecommendation: "", tracklist: [], youtubeLinks: [], comments: []
            }
        ],
        followedUserIds: [],
    },
    {
        id: 'user-3',
        name: 'Sam Smith',
        avatarUrl: `https://i.pravatar.cc/150?u=user-3`,
        collection: [],
        wishlist: [],
        tradeList: [],
        followedUserIds: [],
    }
];

export const activityFeedData: ActivityEvent[] = [
    {
        id: 'act-5',
        user: { id: 'user-2', name: 'Jane Doe', avatarUrl: `https://i.pravatar.cc/150?u=user-2` },
        type: ActivityType.NEW_RATING,
        album: { artist: 'Pink Floyd', album: 'The Dark Side of the Moon', coverArtUrl: 'https://upload.wikimedia.org/wikipedia/en/3/3b/Dark_Side_of_the_Moon.png' },
        details: { rating: 4 },
        timestamp: "2024-07-22T10:00:00Z"
    },
    {
        id: 'act-6',
        user: { id: 'user-1', name: 'Alex Doe', avatarUrl: `https://i.pravatar.cc/150?u=user-1` },
        type: ActivityType.NEW_REVIEW,
        album: { artist: 'Kendrick Lamar', album: 'To Pimp a Butterfly', coverArtUrl: 'https://upload.wikimedia.org/wikipedia/en/f/f6/Kendrick_Lamar_-_To_Pimp_a_Butterfly.png' },
        details: { review: "An absolute masterpiece. The blend of jazz, funk, and hip-hop is groundbreaking. Kendrick's lyricism is at its peak, creating a dense, rewarding listening experience that demands repeated plays." },
        timestamp: "2024-07-22T09:15:00Z"
    },
    {
        id: 'act-1',
        user: { id: 'user-1', name: 'Alex Doe', avatarUrl: `https://i.pravatar.cc/150?u=user-1` },
        type: ActivityType.NEW_COMMENT,
        album: { artist: 'Fleetwood Mac', album: 'Rumours', coverArtUrl: 'https://upload.wikimedia.org/wikipedia/en/f/fb/FMacRumours.png' },
        details: { comment: "First listen, absolutely blown away." },
        timestamp: "2024-07-21T19:30:00Z"
    },
    {
        id: 'act-2',
        user: { id: 'user-2', name: 'Jane Doe', avatarUrl: `https://i.pravatar.cc/150?u=user-2` },
        type: ActivityType.NEW_ALBUM,
        album: { artist: 'Pink Floyd', album: 'The Dark Side of the Moon', coverArtUrl: 'https://upload.wikimedia.org/wikipedia/en/3/3b/Dark_Side_of_the_Moon.png' },
        timestamp: "2024-07-20T10:00:00Z"
    },
    {
        id: 'act-3',
        user: { id: 'user-1', name: 'Alex Doe', avatarUrl: `https://i.pravatar.cc/150?u=user-1` },
        type: ActivityType.NEW_TRADELIST,
        album: { artist: 'Massive Attack', album: 'Mezzanine', coverArtUrl: 'https://upload.wikimedia.org/wikipedia/en/8/85/Massive_Attack_-_Mezzanine.png' },
        timestamp: "2024-07-19T15:45:00Z"
    },
    {
        id: 'act-4',
        user: { id: 'user-2', name: 'Jane Doe', avatarUrl: `https://i.pravatar.cc/150?u=user-2` },
        type: ActivityType.NEW_TRADELIST,
        album: { artist: 'Radiohead', album: 'OK Computer', coverArtUrl: 'https://upload.wikimedia.org/wikipedia/en/b/ba/Radioheadokcomputer.png' },
        timestamp: "2024-07-18T11:20:00Z"
    },
].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

export const tradeOffersData = [];
