import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Song, UserProfile, Update, SongMetadata, PersonalSong } from '../backend';

export function useGetAllSongs() {
  const { actor, isFetching } = useActor();

  return useQuery<Song[]>({
    queryKey: ['songs'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllSongs();
    },
    enabled: !!actor && !isFetching,
    refetchOnMount: true,
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
    refetchOnMount: true,
  });
}

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUploadSong() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (songUpdate: Update) => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.uploadSong(songUpdate);
      } catch (error: any) {
        if (error.message?.includes('Unauthorized')) {
          throw new Error('You do not have permission to upload songs. Admin access required.');
        }
        throw error;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['songs'] });
      await queryClient.invalidateQueries({ queryKey: ['totalSongs'] });
      await queryClient.refetchQueries({ queryKey: ['songs'] });
      await queryClient.refetchQueries({ queryKey: ['totalSongs'] });
    },
  });
}

export function useUploadPublicSong() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (songUpdate: Update) => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.uploadPublicSong(songUpdate);
      } catch (error: any) {
        if (error.message?.includes('Unauthorized')) {
          throw new Error('You must be logged in to upload public songs. Please log in to continue.');
        }
        throw error;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['songs'] });
      await queryClient.invalidateQueries({ queryKey: ['totalSongs'] });
      await queryClient.refetchQueries({ queryKey: ['songs'] });
      await queryClient.refetchQueries({ queryKey: ['totalSongs'] });
    },
  });
}

export function useEditSong() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ songId, songUpdate }: { songId: bigint; songUpdate: Update }) => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.editSong(songId, songUpdate);
      } catch (error: any) {
        if (error.message?.includes('Unauthorized')) {
          throw new Error('You do not have permission to edit songs. Admin access required.');
        }
        throw error;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['songs'] });
      await queryClient.invalidateQueries({ queryKey: ['totalSongs'] });
      await queryClient.refetchQueries({ queryKey: ['songs'] });
    },
  });
}

export function useRemoveSong() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (songId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.removeSong(songId);
      } catch (error: any) {
        if (error.message?.includes('Unauthorized')) {
          throw new Error('You do not have permission to remove songs. Admin access required.');
        }
        throw error;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['songs'] });
      await queryClient.invalidateQueries({ queryKey: ['totalSongs'] });
      await queryClient.refetchQueries({ queryKey: ['songs'] });
    },
  });
}

export function useStreamSongAudio(songId: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['streamAudio', songId?.toString()],
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
    staleTime: Infinity,
    retry: false,
  });
}

export function useDownloadSongAudio() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (songId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.downloadSongAudio(songId);
    },
    onError: (error: any) => {
      if (error.message?.includes('Subscription required')) {
        throw new Error('An active subscription is required to download songs. Please subscribe to continue.');
      }
      if (error.message?.includes('Unauthorized')) {
        throw new Error('You must be logged in to download songs.');
      }
      throw error;
    },
  });
}

// Personal songs hooks
export function useGetPersonalSongMetadata() {
  const { actor, isFetching } = useActor();

  return useQuery<SongMetadata[]>({
    queryKey: ['personalSongMetadata'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPersonalSongMetadata();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUploadPersonalSong() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (songUpdate: Update) => {
      if (!actor) throw new Error('Actor not available');
      return actor.uploadPersonalSong(songUpdate);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personalSongMetadata'] });
    },
    onError: (error: any) => {
      if (error.message?.includes('Unauthorized')) {
        throw new Error('You must be logged in to upload personal songs. Please log in to continue.');
      }
      throw error;
    },
  });
}

export function useStreamPersonalSongAudio(songId: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['streamPersonalAudio', songId?.toString()],
    queryFn: async () => {
      if (!actor || songId === null) return null;
      try {
        return await actor.streamPersonalSongAudio(songId);
      } catch (error) {
        console.error('Failed to stream personal song audio:', error);
        return null;
      }
    },
    enabled: !!actor && !isFetching && songId !== null,
    staleTime: Infinity,
    retry: false,
  });
}

export function useRemovePersonalSong() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (songId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.removePersonalSong(songId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personalSongMetadata'] });
    },
    onError: (error: any) => {
      if (error.message?.includes('Unauthorized')) {
        throw new Error('You can only remove your own songs.');
      }
      throw error;
    },
  });
}
