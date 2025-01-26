import { TrackifyFollowedArtist } from './TrackifyFollowedArtist';

export interface TrackifyFollowedArtistsResponse {
  id: number;
  followed_artists: TrackifyFollowedArtist[];
}