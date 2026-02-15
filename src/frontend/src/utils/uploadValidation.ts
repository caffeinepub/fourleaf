// Maximum audio file size: 100 MB
export const MAX_AUDIO_FILE_SIZE_BYTES = 100 * 1024 * 1024;
export const MAX_AUDIO_FILE_SIZE_MB = 100;

// Maximum cover image size: 10 MB
export const MAX_COVER_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;
export const MAX_COVER_IMAGE_SIZE_MB = 10;

export interface AudioValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateAudioFile(file: File | null): AudioValidationResult {
  if (!file) {
    return {
      isValid: false,
      error: 'Please select an audio file',
    };
  }

  if (file.size > MAX_AUDIO_FILE_SIZE_BYTES) {
    return {
      isValid: false,
      error: `Audio file is too large. Maximum size is ${MAX_AUDIO_FILE_SIZE_MB} MB`,
    };
  }

  return { isValid: true };
}

export function validateCoverImage(file: File | null): AudioValidationResult {
  if (!file) {
    return { isValid: true }; // Cover image is optional
  }

  if (file.size > MAX_COVER_IMAGE_SIZE_BYTES) {
    return {
      isValid: false,
      error: `Cover image is too large. Maximum size is ${MAX_COVER_IMAGE_SIZE_MB} MB`,
    };
  }

  return { isValid: true };
}

export function validateDuration(duration: string): AudioValidationResult {
  if (!duration.trim()) {
    return {
      isValid: false,
      error: 'Duration is required. Please wait for audio metadata to load or enter manually',
    };
  }

  const durationNum = Number(duration);
  if (isNaN(durationNum) || durationNum <= 0) {
    return {
      isValid: false,
      error: 'Please enter a valid duration greater than 0 seconds',
    };
  }

  return { isValid: true };
}

export function validateRequiredField(value: string, fieldName: string): AudioValidationResult {
  if (!value.trim()) {
    return {
      isValid: false,
      error: `Please enter ${fieldName}`,
    };
  }

  return { isValid: true };
}
