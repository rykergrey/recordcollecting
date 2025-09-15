import { GoogleGenAI, Type } from "@google/genai";
import { currentUserData, allUsersData, activityFeedData, tradeOffersData } from './mockData';
import type { 
    User, 
    ActivityEvent, 
    TradeOffer, 
    CollectionAlbumInfo, 
    AlbumInfo, 
    ArtistAlbumSearchResult,
    AlbumAnalysisResult, 
    OfferedAlbum,
    AlbumCondition
} from '../types';

// --- DATABASE SIMULATION ---
// In a real app, this data would live in a database.
// We are cloning it to prevent direct mutation of the imported mock data.
let users: User[] = JSON.parse(JSON.stringify(allUsersData));
let currentUser: User = users.find(u => u.id === currentUserData.id)!;
let activityFeed: ActivityEvent[] = JSON.parse(JSON.stringify(activityFeedData));
let tradeOffers: TradeOffer[] = JSON.parse(JSON.stringify(tradeOffersData));
let albumDatabase: Record<string, Partial<AlbumAnalysisResult>> = {}; // Cache for analysis responses, now partial

const getAlbumId = (album: { artist: string; album: string }) => `${album.artist}-${album.album}`.toLowerCase().replace(/\s/g, '-');

// Helper to simulate network delay
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));


// --- MOCK API ENDPOINTS ---

export const getCurrentUser = async (): Promise<User> => {
    await sleep(200);
    return Promise.resolve(JSON.parse(JSON.stringify(currentUser)));
};

export const getCollection = async (): Promise<CollectionAlbumInfo[]> => {
    await sleep(200);
    return Promise.resolve(JSON.parse(JSON.stringify([...currentUser.collection, ...currentUser.tradeList])));
}

export const getWishlist = async (): Promise<AlbumInfo[]> => {
    await sleep(200);
    return Promise.resolve(JSON.parse(JSON.stringify(currentUser.wishlist)));
}

export const getAllUsers = async (): Promise<User[]> => {
    await sleep(200);
    return Promise.resolve(JSON.parse(JSON.stringify(users)));
}

export const getActivityFeed = async (): Promise<ActivityEvent[]> => {
    await sleep(200);
    return Promise.resolve(JSON.parse(JSON.stringify(activityFeed)));
}

export const getTradeOffers = async (): Promise<TradeOffer[]> => {
    await sleep(200);
    return Promise.resolve(JSON.parse(JSON.stringify(tradeOffers)));
}

export const getStores = async (): Promise<string[]> => {
    await sleep(100);
    const allStores = currentUser.collection.flatMap(a =>
      a.provenance
        .filter(p => p.type === 'purchase' && p.from)
        .map(p => p.from)
    );
    return Promise.resolve([...new Set(allStores)].sort());
}

export const updateAlbumRating = async (albumId: string, rating: number): Promise<CollectionAlbumInfo> => {
    await sleep(300);
    const collection = [...currentUser.collection, ...currentUser.tradeList];
    const targetAlbum = collection.find(a => getAlbumId(a) === albumId);
    
    if (!targetAlbum) throw new Error("Album not found in collection or trade list");
    
    targetAlbum.ratings[currentUser.id] = rating;
    return Promise.resolve(JSON.parse(JSON.stringify(targetAlbum)));
}

export const updateTrackRating = async (albumId: string, trackTitle: string, rating: number): Promise<CollectionAlbumInfo> => {
     await sleep(200);
    const collection = [...currentUser.collection, ...currentUser.tradeList];
    const targetAlbum = collection.find(a => getAlbumId(a) === albumId);
    if (!targetAlbum) throw new Error("Album not found");

    const track = targetAlbum.tracklist.find(t => t.title === trackTitle);
    if (track) {
        if (!track.ratings) {
            track.ratings = {};
        }
        track.ratings[currentUser.id] = rating;
    }
    return Promise.resolve(JSON.parse(JSON.stringify(targetAlbum)));
}

export const addComment = async (albumId: string, text: string): Promise<CollectionAlbumInfo> => {
    await sleep(400);
    const collection = [...currentUser.collection, ...currentUser.tradeList];
    const targetAlbum = collection.find(a => getAlbumId(a) === albumId);
    if (!targetAlbum) throw new Error("Album not found");

    if (!targetAlbum.userComments[currentUser.id]) {
        targetAlbum.userComments[currentUser.id] = [];
    }
    targetAlbum.userComments[currentUser.id].push({ text, timestamp: new Date().toISOString() });
    return Promise.resolve(JSON.parse(JSON.stringify(targetAlbum)));
}

const findSharersOf = (user: User): User[] => {
    return (user.sharedLibraryWith || [])
        .map(userId => users.find(u => u.id === userId))
        .filter((u): u is User => !!u);
}

export const addToCollection = async (analysis: AlbumAnalysisResult, purchaseDetails: { price: number, store: string }, userImage?: string) => {
    await sleep(500);
    const newCollectionItem: CollectionAlbumInfo = {
        ...analysis,
        isPublic: true,
        coverArtUrls: userImage ? [userImage] : analysis.coverArtUrls,
        provenance: [{ type: 'purchase', from: purchaseDetails.store, price: purchaseDetails.price, date: new Date().toISOString() }],
        ratings: {},
        userComments: {},
        tracklist: analysis.tracklist.map(t => ({ ...t, ratings: {} })),
    };
    
    const allSharers = [currentUser, ...findSharersOf(currentUser)];

    for (const user of allSharers) {
        if (![...user.collection, ...user.tradeList].some(item => getAlbumId(item) === getAlbumId(newCollectionItem))) {
            user.collection.unshift(newCollectionItem);
            user.wishlist = user.wishlist.filter(item => getAlbumId(item) !== getAlbumId(newCollectionItem));
        }
    }
    
    const allStores = [...new Set(currentUser.collection.flatMap(a => a.provenance.filter(p => p.type === 'purchase').map(p => p.from)))];

    return Promise.resolve({
        updatedCollection: JSON.parse(JSON.stringify([...currentUser.collection, ...currentUser.tradeList])),
        updatedWishlist: JSON.parse(JSON.stringify(currentUser.wishlist)),
        updatedStores: allStores.sort(),
    });
};

export const addToWishlist = async (albumInfo: AlbumInfo): Promise<AlbumInfo[]> => {
    await sleep(300);
    const albumId = getAlbumId(albumInfo);
    if (!currentUser.wishlist.some(item => getAlbumId(item) === albumId) && ![...currentUser.collection, ...currentUser.tradeList].some(item => getAlbumId(item) === albumId)) {
        currentUser.wishlist.unshift({ ...albumInfo, priority: 'Medium' });
    }
    return Promise.resolve(JSON.parse(JSON.stringify(currentUser.wishlist)));
}

export const updateWishlistPriority = async (albumId: string, priority: 'High' | 'Medium' | 'Low'): Promise<AlbumInfo[]> => {
    await sleep(200);
    const item = currentUser.wishlist.find(item => getAlbumId(item) === albumId);
    if (item) {
        item.priority = priority;
    }
    return Promise.resolve(JSON.parse(JSON.stringify(currentUser.wishlist)));
}

export const toggleFollowUser = async (userId: string) => {
    await sleep(300);
    const followedSet = new Set(currentUser.followedUserIds);
    if (followedSet.has(userId)) {
        followedSet.delete(userId);
    } else {
        followedSet.add(userId);
    }
    currentUser.followedUserIds = Array.from(followedSet);
    return {
        updatedCurrentUser: JSON.parse(JSON.stringify(currentUser)),
        updatedAllUsers: JSON.parse(JSON.stringify(users)),
    };
}

export const updateTradeStatus = async (albumId: string, forTrade: boolean, condition?: AlbumCondition) => {
    await sleep(400);
    
    const allSharers = [currentUser, ...findSharersOf(currentUser)];
    let updatedAlbum: CollectionAlbumInfo | undefined;

    for (const user of allSharers) {
        let albumToUpdate: CollectionAlbumInfo | undefined;
        if (forTrade) {
            albumToUpdate = user.collection.find(a => getAlbumId(a) === albumId);
            if (albumToUpdate) {
                user.collection = user.collection.filter(a => getAlbumId(a) !== albumId);
                albumToUpdate.forTrade = true;
                albumToUpdate.condition = condition;
                user.tradeList.push(albumToUpdate);
            }
        } else {
            albumToUpdate = user.tradeList.find(a => getAlbumId(a) === albumId);
            if (albumToUpdate) {
                user.tradeList = user.tradeList.filter(a => getAlbumId(a) !== albumId);
                albumToUpdate.forTrade = false;
                delete albumToUpdate.condition;
                user.collection.push(albumToUpdate);
            }
        }
        
        if (!albumToUpdate) {
            albumToUpdate = user.tradeList.find(a => getAlbumId(a) === albumId);
            if (albumToUpdate) {
                albumToUpdate.condition = condition;
            } else if (user.id === currentUser.id) {
                throw new Error("Album not found");
            }
        }

        if (user.id === currentUser.id) {
            updatedAlbum = albumToUpdate;
        }
    }
    
    if (!updatedAlbum) throw new Error("Current user's album not found after update");

    return {
        updatedAlbum: JSON.parse(JSON.stringify(updatedAlbum)),
        updatedCollection: JSON.parse(JSON.stringify([...currentUser.collection, ...currentUser.tradeList]))
    };
}


export const sendTradeOffer = async (offer: { toUser: User; wantedAlbum: CollectionAlbumInfo; offeredAlbums: OfferedAlbum[] }): Promise<TradeOffer> => {
    await sleep(500);
    const newOffer: TradeOffer = {
        id: `trade-${Date.now()}`,
        fromUser: { id: currentUser.id, name: currentUser.name, avatarUrl: currentUser.avatarUrl },
        toUser: { id: offer.toUser.id, name: offer.toUser.name, avatarUrl: offer.toUser.avatarUrl },
        wantedAlbum: offer.wantedAlbum,
        offeredAlbums: offer.offeredAlbums,
        status: 'pending',
        timestamp: new Date().toISOString(),
    };
    tradeOffers.push(newOffer);
    return Promise.resolve(JSON.parse(JSON.stringify(newOffer)));
}

export const acceptTrade = async (offerId: string) => {
    await sleep(600);
    const offer = tradeOffers.find(o => o.id === offerId);
    if (!offer) throw new Error("Offer not found");
    
    offer.status = 'accepted';
    
    const fromUser = users.find(u => u.id === offer.fromUser.id)!;
    const toUser = users.find(u => u.id === offer.toUser.id)!; // This is the currentUser

    // Remove wanted album from currentUser's trade list
    toUser.tradeList = toUser.tradeList.filter(a => getAlbumId(a) !== getAlbumId(offer.wantedAlbum));

    // Add offered albums to currentUser's collection
    toUser.collection.push(...offer.offeredAlbums.map(a => ({...a, forTrade: false, condition: undefined})));
    
    // Remove offered albums from fromUser's trade list
    const offeredIds = new Set(offer.offeredAlbums.map(getAlbumId));
    fromUser.tradeList = fromUser.tradeList.filter(a => !offeredIds.has(getAlbumId(a)));

    // Add wanted album to fromUser's collection
    fromUser.collection.push({...offer.wantedAlbum, forTrade: false, condition: undefined});
    
    return Promise.resolve({
        updatedOffers: JSON.parse(JSON.stringify(tradeOffers)),
        updatedCollection: JSON.parse(JSON.stringify([...toUser.collection, ...toUser.tradeList])),
        updatedUsers: JSON.parse(JSON.stringify(users))
    });
}

export const rejectTrade = async (offerId: string): Promise<TradeOffer[]> => {
    await sleep(300);
    const offer = tradeOffers.find(o => o.id === offerId);
    if (offer) {
        offer.status = 'rejected';
    }
    return Promise.resolve(JSON.parse(JSON.stringify(tradeOffers)));
}

// --- Library Sharing API ---

export const sendLibraryShareRequest = async (toUserId: string) => {
    await sleep(300);
    const toUser = users.find(u => u.id === toUserId);
    if (!toUser) throw new Error("User not found");
    
    currentUser.libraryShareRequests![toUserId] = 'sent';
    toUser.libraryShareRequests![currentUser.id] = 'received';
    
    return {
        updatedCurrentUser: JSON.parse(JSON.stringify(currentUser)),
        updatedAllUsers: JSON.parse(JSON.stringify(users)),
    };
};

export const rejectLibraryShareRequest = async (fromUserId: string) => {
    await sleep(300);
    const fromUser = users.find(u => u.id === fromUserId);
    if (!fromUser) throw new Error("User not found");

    delete currentUser.libraryShareRequests![fromUserId];
    delete fromUser.libraryShareRequests![currentUser.id];

    return {
        updatedCurrentUser: JSON.parse(JSON.stringify(currentUser)),
        updatedAllUsers: JSON.parse(JSON.stringify(users)),
    };
};

export const acceptLibraryShareRequest = async (fromUserId: string) => {
    await sleep(800);
    const fromUser = users.find(u => u.id === fromUserId);
    if (!fromUser) throw new Error("User not found");

    // Add to shared list
    currentUser.sharedLibraryWith!.push(fromUserId);
    fromUser.sharedLibraryWith!.push(currentUser.id);

    // Remove requests
    delete currentUser.libraryShareRequests![fromUserId];
    delete fromUser.libraryShareRequests![currentUser.id];
    
    // Merge collections
    const allCollections = [...currentUser.collection, ...currentUser.tradeList, ...fromUser.collection, ...fromUser.tradeList];
    const collectionMap = new Map<string, CollectionAlbumInfo>();
    
    for (const album of allCollections) {
        const id = getAlbumId(album);
        if (collectionMap.has(id)) {
            const existing = collectionMap.get(id)!;
            // Merge ratings and comments
            existing.ratings = { ...existing.ratings, ...album.ratings };
            existing.userComments = { ...existing.userComments, ...album.userComments };
            album.tracklist.forEach((track, i) => {
                existing.tracklist[i].ratings = { ...existing.tracklist[i].ratings, ...track.ratings };
            });
        } else {
            collectionMap.set(id, JSON.parse(JSON.stringify(album)));
        }
    }

    const mergedFullCollection = Array.from(collectionMap.values());
    const mergedCollection = mergedFullCollection.filter(a => !a.forTrade);
    const mergedTradeList = mergedFullCollection.filter(a => a.forTrade);

    currentUser.collection = mergedCollection;
    currentUser.tradeList = mergedTradeList;
    fromUser.collection = mergedCollection;
    fromUser.tradeList = mergedTradeList;

    return {
        updatedCurrentUser: JSON.parse(JSON.stringify(currentUser)),
        updatedAllUsers: JSON.parse(JSON.stringify(users)),
        mergedCollection: JSON.parse(JSON.stringify([...mergedCollection, ...mergedTradeList])),
    };
};


// --- Rykersoft Analysis API ---

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fileToGenerativePart = (base64: string, mimeType: string) => {
  return { inlineData: { data: base64, mimeType } };
};

export const identifyAlbumFromImage = async (base64Image: string, mimeType: string): Promise<Pick<AlbumInfo, 'artist' | 'album'>> => {
  const imagePart = fileToGenerativePart(base64Image, mimeType);
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts: [ imagePart, { text: "Identify the artist and album title from this image. Respond in JSON format with 'artist' and 'album' keys." } ] },
    config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { artist: { type: Type.STRING }, album: { type: Type.STRING } }, required: ["artist", "album"] } }
  });
  return JSON.parse(response.text);
};

export const searchAlbumsByArtist = async (query: string): Promise<ArtistAlbumSearchResult[]> => {
    const prompt = `A user is searching for albums by an artist or a specific album. The query is: "${query}". If the query seems to be an artist's name, list their 5 most notable or critically acclaimed studio albums. If the query seems to be an album title, return just that one album with its artist. Respond with a JSON array of objects, where each object has "artist", "album", and "year".`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: "application/json", responseSchema: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { artist: { type: Type.STRING }, album: { type: Type.STRING }, year: { type: Type.INTEGER } }, required: ["artist", "album", "year"] } } }
    });
    return JSON.parse(response.text);
};

export const getSuggestedTracks = async (albumInfo: { artist: string; album: string }): Promise<AlbumAnalysisResult['tracklist']> => {
  const albumId = getAlbumId(albumInfo);
  if (albumDatabase[albumId]?.tracklist) {
    console.log("Returning cached tracks for", albumId);
    return Promise.resolve(JSON.parse(JSON.stringify(albumDatabase[albumId]!.tracklist!)));
  }
  console.log("Fetching new tracks for", albumId);

  const prompt = `Provide a list of 3 to 5 notable or popular tracks from the album "${albumInfo.album}" by "${albumInfo.artist}". Your response MUST be in a valid JSON format: an array of objects, where each object has "title", "description", and a "youtubeMusicUrl" which is a direct search query URL on YouTube Music.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            youtubeMusicUrl: { type: Type.STRING }
          },
          required: ["title", "description", "youtubeMusicUrl"]
        }
      }
    }
  });

  const tracks = JSON.parse(response.text);
  albumDatabase[albumId] = { ...albumDatabase[albumId], tracklist: tracks };
  return tracks;
};

export const getPersonalRecommendation = async (albumInfo: { artist: string; album: string }, collection: CollectionAlbumInfo[]): Promise<string> => {
    await sleep(1500); // Simulate AI thinking
    const highlyRatedAlbums = collection.filter(album => album.ratings[currentUser.id] && album.ratings[currentUser.id] >= 4).map(album => `- "${album.album}" by ${album.artist} (Genre: ${album.genre}, Rated: ${album.ratings[currentUser.id]}/5)`).join('\n');
    const userCollectionPrompt = highlyRatedAlbums.length > 0
        ? `The user's collection includes these highly-rated albums:\n${highlyRatedAlbums}\nBased on this, explain why they might enjoy the album.`
        : 'The user has not rated any albums yet. Generate the recommendation for a new collector.';
    
    const prompt = `You are a music expert for RecordCollect.ing, a Rykersoft application. A user is asking for a personal recommendation for the album "${albumInfo.album}" by "${albumInfo.artist}".
    ${userCollectionPrompt}
    Your response should be a single, concise paragraph. Do not respond in JSON, just the text of the recommendation itself.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });

    return response.text;
};

export const getFullAlbumAnalysis = async (albumInfo: { artist: string; album: string }): Promise<Omit<AlbumAnalysisResult, 'tracklist' | 'personalRecommendation'>> => {
  const albumId = getAlbumId(albumInfo);
  if (albumDatabase[albumId]?.albumDescription) {
      console.log("Returning cached full analysis for", albumId);
      const { tracklist, personalRecommendation, ...analysis } = albumDatabase[albumId]!;
      return Promise.resolve(JSON.parse(JSON.stringify(analysis)));
  }
  console.log("Fetching new full analysis for", albumId);

  const prompt = `You are an expert music historian and critic for RecordCollect.ing, an application by Rykersoft. Provide a deep and comprehensive analysis of the album "${albumInfo.album}" by "${albumInfo.artist}". Your response MUST be in a valid JSON format. Generate all the following fields: artist, album, year, genre, coverArtUrls (an array with one public URL), albumDescription, buyThisIf (array of 3 strings), avoidThisIf (array of 3 strings), notableFacts (array of 3 strings), historicalSignificance, musicalStyle, legacy, and youtubeLinks (array of 2-3 objects with title and url). Do NOT include 'tracklist' or 'personalRecommendation' fields.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          artist: { type: Type.STRING },
          album: { type: Type.STRING },
          year: { type: Type.INTEGER },
          genre: { type: Type.STRING },
          coverArtUrls: { type: Type.ARRAY, items: { type: Type.STRING } },
          albumDescription: { type: Type.STRING },
          buyThisIf: { type: Type.ARRAY, items: { type: Type.STRING } },
          avoidThisIf: { type: Type.ARRAY, items: { type: Type.STRING } },
          notableFacts: { type: Type.ARRAY, items: { type: Type.STRING } },
          historicalSignificance: { type: Type.STRING },
          musicalStyle: { type: Type.STRING },
          legacy: { type: Type.STRING },
          youtubeLinks: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, url: { type: Type.STRING } }, required: ["title", "url"] } }
        },
        required: ["artist", "album", "year", "genre", "coverArtUrls", "albumDescription", "buyThisIf", "avoidThisIf", "notableFacts", "historicalSignificance", "musicalStyle", "legacy", "youtubeLinks"]
      }
    }
  });

  const analysisResult = JSON.parse(response.text);
  albumDatabase[albumId] = { ...albumDatabase[albumId], ...analysisResult }; // Save to cache
  return analysisResult;
};

export const parseAlbumsFromText = async (text: string): Promise<{ artist: string, album: string }[]> => {
    const prompt = `Parse the following text to identify a list of music albums. For each album, provide the artist and the album title. The text might contain conjunctions, different phrasing, and album numbers. For example, for "Meatloaf's bat out of hell 1, and 2", you should return two separate entries. Respond ONLY with a valid JSON array of objects, where each object has 'artist' and 'album' keys. Text: "${text}"`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        artist: { type: Type.STRING },
                        album: { type: Type.STRING },
                    },
                    required: ["artist", "album"]
                }
            }
        }
    });
    return JSON.parse(response.text);
}
