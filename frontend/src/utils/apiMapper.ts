import TrackWatchUser from "../types/trackwatch/TrackWatchUser";
import TrackWatchArtist from "../types/trackwatch/TrackWatchArtist";

const toCamelCase = (str: string): string => {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
};

const mapObjectToCamelCase = <T>(obj: unknown): T => {
    if (Array.isArray(obj)) {
        return obj.map(mapObjectToCamelCase) as unknown as T;
    }

    if (isRecord(obj)) {
        return Object.keys(obj).reduce<Record<string, unknown>>((result, key) => {
            const camelKey = toCamelCase(key);
            result[camelKey] = mapObjectToCamelCase(obj[key]);
            return result;
        }, {}) as T;
    }

    return obj as T;
};

export const mapTrackWatchUser = (data: unknown): TrackWatchUser => {
    return mapObjectToCamelCase<TrackWatchUser>(data);
};

export const mapTrackWatchArtist = (data: unknown): TrackWatchArtist => {
    return mapObjectToCamelCase<TrackWatchArtist>(data);
};
