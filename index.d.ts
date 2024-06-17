import { EventEmitter } from "events";
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

class SoundCloudTrack{
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
    type: 'track';
    clientId: string;
}

class SoundCloudBaseTrack{
    id: string;
    partial: true;
    type: 'track';
    clientId: string;
}

class SoundCloudPlaylist{
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
    type: 'playlist';
    clientId: string;
}

class SoundCloudStream extends EventEmitter{
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

export function getInfo(url: string) : Promise<SoundCloudTrack | SoundCloudPlaylist>;

export function stream(info: string | SoundCloudtrack, options: StreamOptions) : Promise<SoundCloudStream>;

export function search(query: string, options: SearchOptions) : Promise<[SoundCloudtrack | SoundCloudPlaylist]>;

export function getClientId() : Promise<string>;
