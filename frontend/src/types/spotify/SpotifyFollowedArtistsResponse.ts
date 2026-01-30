export interface SpotifyFollowedArtistsResponse {
    artists: {
        items: SpotifyArtist[];
        cursors: {
            after: string | null;
        };
        total: number;
        limit: number;
    };
}

export interface SpotifyArtist {
    id: string;
    name: string;
    images: SpotifyImage[];
    genres: string[];
    popularity: number;
    external_urls: {
        spotify: string;
    };
}

export interface SpotifyImage {
    url: string;
    height: number;
    width: number;
}
