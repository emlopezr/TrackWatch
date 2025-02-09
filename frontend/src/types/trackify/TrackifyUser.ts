import { TrackifyArtist } from "./TrackifyArtist";

export interface TrackifyUser {
  id: string;
  email: string;
  name: string;
  imageUrl: string;
  settings: TrackifyUserSettings;
  followedArtists: TrackifyArtist[];
}

interface TrackifyUserSettings {
  blockedExplicitContent: boolean;
}