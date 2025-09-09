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
    let targetAlbum: CollectionAlbumInfo | undefined = currentUser.collection.find(a => getAlbumId(a) === albumId);
    if (!targetAlbum) {
         targetAlbum = currentUser.tradeList.find(a => getAlbumId(a) === albumId);
    }
    if (!targetAlbum) throw new Error("Album not found in collection or trade list");
    
    targetAlbum.rating = rating;
    return Promise.resolve(JSON.parse(JSON.stringify(targetAlbum)));
}

export const updateTrackRating = async (albumId: string, trackTitle: string, rating: number): Promise<CollectionAlbumInfo> => {
     await sleep(200);
    let targetAlbum: CollectionAlbumInfo | undefined = currentUser.collection.find(a => getAlbumId(a) === albumId);
    if (!targetAlbum) {
         targetAlbum = currentUser.tradeList.find(a => getAlbumId(a) === albumId);
    }
    if (!targetAlbum) throw new Error("Album not found");

    const track = targetAlbum.tracklist.find(t => t.title === trackTitle);
    if (track) {
        track.rating = rating;
    }
    return Promise.resolve(JSON.parse(JSON.stringify(targetAlbum)));
}

export const addComment = async (albumId: string, text: string): Promise<CollectionAlbumInfo> => {
    await sleep(400);
    let targetAlbum: CollectionAlbumInfo | undefined = currentUser.collection.find(a => getAlbumId(a) === albumId);
    if (!targetAlbum) {
         targetAlbum = currentUser.tradeList.find(a => getAlbumId(a) === albumId);
    }
    if (!targetAlbum) throw new Error("Album not found");

    targetAlbum.comments.push({ text, timestamp: new Date().toISOString() });
    return Promise.resolve(JSON.parse(JSON.stringify(targetAlbum)));
}

export const addToCollection = async (analysis: AlbumAnalysisResult, purchaseDetails: { price: number, store: string }, userImage?: string) => {
    await sleep(500);
    const newCollectionItem: CollectionAlbumInfo = {
        ...analysis,
        isPublic: true,
        coverArtUrls: userImage ? [userImage] : analysis.coverArtUrls,
        provenance: [{ type: 'purchase', from: purchaseDetails.store, price: purchaseDetails.price, date: new Date().toISOString() }],
        comments: [],
        tracklist: analysis.tracklist.map(t => ({ ...t, rating: 0 })),
    };
    
    if (![...currentUser.collection, ...currentUser.tradeList].some(item => getAlbumId(item) === getAlbumId(newCollectionItem))) {
        currentUser.collection.unshift(newCollectionItem);
        currentUser.wishlist = currentUser.wishlist.filter(item => getAlbumId(item) !== getAlbumId(newCollectionItem));
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

export const toggleFollowUser = async (userId: string): Promise<User> => {
    await sleep(300);
    const followedSet = new Set(currentUser.followedUserIds);
    if (followedSet.has(userId)) {
        followedSet.delete(userId);
    } else {
        followedSet.add(userId);
    }
    currentUser.followedUserIds = Array.from(followedSet);
    return Promise.resolve(JSON.parse(JSON.stringify(currentUser)));
}

export const updateTradeStatus = async (albumId: string, forTrade: boolean, condition?: AlbumCondition): Promise<CollectionAlbumInfo> => {
    await sleep(400);
    let albumToUpdate: CollectionAlbumInfo | undefined;

    if (forTrade) { // Moving from collection to trade list
        albumToUpdate = currentUser.collection.find(a => getAlbumId(a) === albumId);
        if (albumToUpdate) {
            currentUser.collection = currentUser.collection.filter(a => getAlbumId(a) !== albumId);
            albumToUpdate.forTrade = true;
            albumToUpdate.condition = condition;
            currentUser.tradeList.push(albumToUpdate);
        }
    } else { // Moving from trade list to collection
        albumToUpdate = currentUser.tradeList.find(a => getAlbumId(a) === albumId);
        if (albumToUpdate) {
            currentUser.tradeList = currentUser.tradeList.filter(a => getAlbumId(a) !== albumId);
            albumToUpdate.forTrade = false;
            delete albumToUpdate.condition;
            currentUser.collection.push(albumToUpdate);
        }
    }
    
    if (!albumToUpdate) {
        // If it wasn't moved, it might just be a condition update for an existing trade item
        albumToUpdate = currentUser.tradeList.find(a => getAlbumId(a) === albumId);
        if (albumToUpdate) {
            albumToUpdate.condition = condition;
        } else {
            throw new Error("Album not found");
        }
    }
    return Promise.resolve(JSON.parse(JSON.stringify(albumToUpdate)));
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


// --- Rykersoft Analysis API ---
// These would be replaced by calls to our own backend, which would then call our analysis service securely.

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
    const highlyRatedAlbums = collection.filter(album => album.rating && album.rating >= 4).map(album => `- "${album.album}" by ${album.artist} (Genre: ${album.genre}, Rated: ${album.rating}/5)`).join('\n');
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
