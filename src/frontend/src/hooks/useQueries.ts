import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { Song, PersonalSong, UserProfile, Update, SongMetadata } from '../backend';
import { ExternalBlob, UserRole } from '../backend';
import { normalizeBackendError } from '../utils/backendErrors';
import { Principal } from '@dfinity/principal';

export function useGetAllSongs() {
  const { actor, isFetching } = useActor();

  return useQuery<Song[]>({
    queryKey: ['songs'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllSongs();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetTotalSongs() {
  const { actor, isFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ['totalSongs'],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getTotalSongs();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetPersonalSongs() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<PersonalSong[]>({
    queryKey: ['personalSongs'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getPersonalSongs();
      } catch (error: any) {
        console.error('Failed to fetch personal songs:', error);
        if (error.message?.includes('Unauthorized')) {
          return [];
        }
        throw error;
      }
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching && !!identity,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      if (!identity) throw new Error('You must be logged in to save your profile');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: (_, profile) => {
      // Immediately update the cache with the saved profile
      queryClient.setQueryData(['currentUserProfile'], profile);
      // Then invalidate to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
    onError: (error: any) => {
      console.error('Failed to save profile:', error);
      throw new Error(normalizeBackendError(error));
    },
  });
}

export function useUploadPublicSong() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (songUpdate: Update) => {
      if (!actor) throw new Error('Actor not available');
      if (!identity) throw new Error('You must be logged in to upload songs');
      return actor.uploadPublicSong(songUpdate);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['songs'] });
      queryClient.invalidateQueries({ queryKey: ['totalSongs'] });
      queryClient.refetchQueries({ queryKey: ['songs'] });
      queryClient.refetchQueries({ queryKey: ['totalSongs'] });
    },
    onError: (error: any) => {
      console.error('Failed to upload public song:', error);
      throw new Error(normalizeBackendError(error));
    },
  });
}

export function useUploadPersonalSong() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (songUpdate: Update) => {
      if (!actor) throw new Error('Actor not available');
      if (!identity) throw new Error('You must be logged in to upload songs');
      return actor.uploadPersonalSong(songUpdate);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personalSongs'] });
      queryClient.refetchQueries({ queryKey: ['personalSongs'] });
    },
    onError: (error: any) => {
      console.error('Failed to upload personal song:', error);
      throw new Error(normalizeBackendError(error));
    },
  });
}

export function useEditSong() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ songId, songUpdate }: { songId: bigint; songUpdate: Update }) => {
      if (!actor) throw new Error('Actor not available');
      if (!identity) throw new Error('You must be logged in to edit songs');
      // Backend method doesn't exist yet
      throw new Error('Song editing is not yet implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['songs'] });
      queryClient.refetchQueries({ queryKey: ['songs'] });
    },
    onError: (error: any) => {
      console.error('Failed to edit song:', error);
      throw new Error(normalizeBackendError(error));
    },
  });
}

export function useRemoveSong() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (songId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      if (!identity) throw new Error('You must be logged in to remove songs');
      // Backend method doesn't exist yet
      throw new Error('Song removal is not yet implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['songs'] });
      queryClient.invalidateQueries({ queryKey: ['totalSongs'] });
      queryClient.refetchQueries({ queryKey: ['songs'] });
      queryClient.refetchQueries({ queryKey: ['totalSongs'] });
    },
    onError: (error: any) => {
      console.error('Failed to remove song:', error);
      throw new Error(normalizeBackendError(error));
    },
  });
}

export function useRemovePersonalSong() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (songId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      if (!identity) throw new Error('You must be logged in to remove songs');
      // Backend method doesn't exist yet
      throw new Error('Personal song removal is not yet implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personalSongs'] });
      queryClient.refetchQueries({ queryKey: ['personalSongs'] });
    },
    onError: (error: any) => {
      console.error('Failed to remove personal song:', error);
      throw new Error(normalizeBackendError(error));
    },
  });
}

export function useStreamSongAudio(songId: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<ExternalBlob | null>({
    queryKey: ['streamSongAudio', songId?.toString()],
    queryFn: async () => {
      if (!actor || songId === null) return null;
      try {
        return await actor.streamSongAudio(songId);
      } catch (error) {
        console.error('Failed to stream song audio:', error);
        return null;
      }
    },
    enabled: !!actor && !isFetching && songId !== null,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useStreamPersonalSongAudio(songId: bigint | null) {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<ExternalBlob | null>({
    queryKey: ['streamPersonalSongAudio', songId?.toString()],
    queryFn: async () => {
      if (!actor || songId === null) return null;
      try {
        return await actor.streamPersonalSongAudio(songId);
      } catch (error) {
        console.error('Failed to stream personal song audio:', error);
        return null;
      }
    },
    enabled: !!actor && !isFetching && songId !== null && !!identity,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useDownloadSongAudio() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();

  return useMutation({
    mutationFn: async (songId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      if (!identity) throw new Error('You must be logged in to download songs');
      return actor.downloadSongAudio(songId);
    },
    onError: (error: any) => {
      console.error('Failed to download song:', error);
      throw new Error(normalizeBackendError(error));
    },
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCallerPrincipal() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Principal | null>({
    queryKey: ['callerPrincipal'],
    queryFn: async () => {
      if (!identity) return null;
      // Backend doesn't have getCallerPrincipal, use identity directly
      return identity.getPrincipal();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useGrantAdminRole() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (targetPrincipal: Principal) => {
      if (!actor) throw new Error('Actor not available');
      if (!identity) throw new Error('You must be logged in to grant admin access');
      return actor.assignCallerUserRole(targetPrincipal, UserRole.admin);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['isCallerAdmin'] });
    },
    onError: (error: any) => {
      console.error('Failed to grant admin role:', error);
      throw new Error(normalizeBackendError(error));
    },
  });
}

// Prefetch helper for preloading audio
export function usePrefetchSongAudio() {
  const queryClient = useQueryClient();
  const { actor } = useActor();

  return {
    prefetchCatalogSong: async (songId: bigint) => {
      if (!actor) return;
      await queryClient.prefetchQuery({
        queryKey: ['streamSongAudio', songId.toString()],
        queryFn: async () => {
          try {
            return await actor.streamSongAudio(songId);
          } catch (error) {
            console.error('Failed to prefetch catalog song audio:', error);
            return null;
          }
        },
        staleTime: 5 * 60 * 1000,
      });
    },
    prefetchPersonalSong: async (songId: bigint) => {
      if (!actor) return;
      await queryClient.prefetchQuery({
        queryKey: ['streamPersonalSongAudio', songId.toString()],
        queryFn: async () => {
          try {
            return await actor.streamPersonalSongAudio(songId);
          } catch (error) {
            console.error('Failed to prefetch personal song audio:', error);
            return null;
          }
        },
        staleTime: 5 * 60 * 1000,
      });
    },
  };
}
