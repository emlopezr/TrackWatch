import { apiFetch } from "../api";
import SpotifyArtistResponse from "../../types/spotify/SpotifyArtistResponse";

export const searchArtists = async (
    searchQuery: string,
    setArtistsData: (data: SpotifyArtistResponse[]) => void
): Promise<SpotifyArtistResponse[]> => {
    try {
        if (!searchQuery || searchQuery.length === 0) {
            setArtistsData([]);
            return [];
        }

        const params = new URLSearchParams({
            q: searchQuery,
            type: "artist",
            limit: "10",
        });

        const response = await apiFetch(`/spotify/search?${params}`);

        if (response.status === 401) {
            console.error("Invalid session");
            return [];
        }

        const data = await response.json();
        setArtistsData(data.artists.items);
        return data.artists.items as SpotifyArtistResponse[];
    } catch {
        console.error("Error fetching artists");
        return [];
    }
};
