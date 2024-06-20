import { Readable } from "stream";

type StreamOptions = {
    highWaterMark: number;
    format: number;
    download: boolean;
};

type SearchOptions = {
    limit: number;
    type: 'tracks' | 'albums' | 'playlists';
};

interface StreamEvents {
    ready: [];
    error: [Error];
};

interface SoundCloudTrack{
    uploaded: Date;
    description?: string;
    duration: number;
    genre: string;
    id: number;
    title: string;
    likes: number;
    url: string;
    streams: number;
    author: {
        name: string;
        image: string;
        url: string;
        followers: number;
    };
    formats: [];
    partial: false;
    thumbnail: string;
    type: 'track';
    clientId: string;
}

interface SoundCloudBaseTrack{
    id: string;
    partial: true;
    type: 'track';
    clientId: string;
}

interface SoundCloudPlaylist{
    created: Date;
    description?: string;
    duration: number;
    genre: string;
    id: number;
    title: string;
    likes: number;
    author: {
        name: string;
        image: string;
        url: string;
        followers: number;
    }
    songs: [SoundCloudTrack | SoundCloudBaseTrack];
    thumbnail: string;
    type: 'playlist';
    clientId: string;
}

interface SoundCloudStream{
    stream: Readable;
    url: string;
    retryCount: number;
    ready: boolean;
    info: SoundCloudTrack;
    options: {
        format?: number;
        download?: boolean;
        highWaterMark?: number;
    };
    downloaded_time: number;
    time: [number];
    sub_urls: [string];

    on<T extends keyof StreamEvents>(eventName: T, listener: (...args: StreamEvents[T]) => void);

    once<T extends keyof StreamEvents>(eventName: T, listener: (...args: StreamEvents[T]) => void);

    emit<T extends keyof StreamEvents>(eventName: T, listener: (...args: StreamEvents[T]) => void);

}

/**
 * Receives information about a playlist or a track on SoundCloud
 * @param url The url of the SoundCloud playlist or track
 */
export function getInfo(url: string) : Promise<SoundCloudTrack | SoundCloudPlaylist>;

/**
 * Creates a readable stream for a SoundCloud track
 * @param info The url of the SoundCloud track or an instance of the SoundCloudTrack class of the track you would like to create a readable stream for
 * @param options Additional options for the stream function
 */
export function stream(info: string | SoundCloudtrack, options: StreamOptions) : Promise<SoundCloudStream>;

/**
 * Searches for a track, playlist or album on SoundCloud
 * @param query The query you would like to use for the search
 * @param options Additional options to specify your search
 */
export function search(query: string, options: SearchOptions) : Promise<[SoundCloudtrack | SoundCloudPlaylist]>;

/**
 * Updates the client id used to get the information from SoundCloud
 */
export function getClientId() : Promise<string>;

/**
 * Fetches a track by only using the track id
 * @param trackId The track id of the song you would like to fetch
 */
export function fetchTrack(trackId: string | number) : Promise<SoundCloudTrack>;

/**
 * Checks whether a url is a valid SoundCloud url or not
 * @param url The SoundCloud url you would like to validate
 */
export function validateSoundCloudURL(url: string) : boolean;
