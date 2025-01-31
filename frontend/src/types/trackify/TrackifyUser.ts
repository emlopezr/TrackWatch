import { TrackifyArtist } from "./TrackifyArtist";

export interface TrackifyUser {
  id: string;
  email: string;
  name: string;

  settings: {
    blockedExplicitContent: boolean;
  };

  images: {
    height: number;
    url: string;
    width: number;
  }[];

  followedArtists: TrackifyArtist[];
}