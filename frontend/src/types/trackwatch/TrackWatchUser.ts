import { TrackWatchArtist } from "./TrackWatchArtist";

export interface TrackWatchUser {
  id: string;
  email: string;
  name: string;
  imageUrl: string;
  settings: TrackWatchUserSettings;
  followedArtists: TrackWatchArtist[];
}

interface TrackWatchUserSettings {
  blockedExplicitContent: boolean;
}