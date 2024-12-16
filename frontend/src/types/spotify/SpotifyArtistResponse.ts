export interface SpotifyArtistResponse {
  id: string;
  name: string;
  external_urls: {
    spotify: string;
  };
  genres: string[];
  images: {
    url: string;
    height: number;
    width: number;
  }[];
}