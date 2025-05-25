import TrackWatchUser from "../types/trackwatch/TrackWatchUser";
import TrackWatchArtist from "../types/trackwatch/TrackWatchArtist";

const toCamelCase = (str: string): string => {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};

const mapObjectToCamelCase = <T>(obj: any): T => {
    if (Array.isArray(obj)) {
        return obj.map(mapObjectToCamelCase) as unknown as T;
    }

    if (obj !== null && typeof obj === 'object') {
        return Object.keys(obj).reduce((result, key) => {
            const camelKey = toCamelCase(key);
            result[camelKey] = mapObjectToCamelCase(obj[key]);
            return result;
        }, {} as any) as T;
    }

    return obj as T;
};

export const mapTrackWatchUser = (data: any): TrackWatchUser => {
    return mapObjectToCamelCase<TrackWatchUser>(data);
};

export const mapTrackWatchArtist = (data: any): TrackWatchArtist => {
    return mapObjectToCamelCase<TrackWatchArtist>(data);
}; 