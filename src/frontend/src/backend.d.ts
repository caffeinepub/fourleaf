import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface PersonalSong {
    id: bigint;
    title: string;
    duration: bigint;
    album: string;
    owner: Principal;
    audioFile: ExternalBlob;
    coverImage?: ExternalBlob;
    artist: string;
}
export interface Update {
    title: string;
    duration: bigint;
    album: string;
    audioFile: ExternalBlob;
    coverImage?: ExternalBlob;
    artist: string;
}
export interface Song {
    id: bigint;
    title: string;
    duration: bigint;
    album: string;
    audioFile: ExternalBlob;
    coverImage?: ExternalBlob;
    artist: string;
}
export interface UserProfile {
    hasActiveSubscription: boolean;
    name: string;
}
export interface SongMetadata {
    id: bigint;
    title: string;
    duration: bigint;
    album: string;
    audioFile: ExternalBlob;
    coverImage?: ExternalBlob;
    artist: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    downloadPersonalSongAudio(songId: bigint): Promise<ExternalBlob>;
    downloadSongAudio(songId: bigint): Promise<ExternalBlob>;
    editPersonalSong(songId: bigint, songUpdate: Update): Promise<void>;
    editSong(songId: bigint, songUpdate: Update): Promise<void>;
    getAllSongs(): Promise<Array<Song>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getPersonalSongMetadata(): Promise<Array<SongMetadata>>;
    getPersonalSongs(): Promise<Array<PersonalSong>>;
    getSong(id: bigint): Promise<Song | null>;
    getSongsByDuration(): Promise<Array<Song>>;
    getTotalSongs(): Promise<bigint>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isPersonalSongOwner(songId: bigint): Promise<boolean>;
    removePersonalSong(songId: bigint): Promise<void>;
    removeSong(songId: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    streamPersonalSongAudio(songId: bigint): Promise<ExternalBlob>;
    streamSongAudio(songId: bigint): Promise<ExternalBlob | null>;
    uploadPersonalSong(songUpdate: Update): Promise<bigint>;
    uploadPublicSong(songUpdate: Update): Promise<bigint>;
    uploadSong(songUpdate: Update): Promise<bigint>;
}
