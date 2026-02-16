/**
 * Normalizes backend errors into user-friendly messages.
 * Strips raw trap text and provides clear English error messages.
 */
export function normalizeBackendError(error: any): string {
  if (!error) return 'An unknown error occurred';

  const errorMessage = error.message || String(error);

  // Authorization errors - check for typed upload errors first
  if (errorMessage.includes('Unauthorized') || errorMessage.includes('permission')) {
    // Check for explicit admin requirement
    if (errorMessage.toLowerCase().includes('admin') && 
        (errorMessage.toLowerCase().includes('only') || errorMessage.toLowerCase().includes('required'))) {
      return 'Admin access required for this action.';
    }
    // Check for login requirement
    if (errorMessage.includes('logged in') || errorMessage.includes('authenticated')) {
      return 'Please log in to continue.';
    }
    // Check for user role requirement (from typed upload errors)
    if (errorMessage.includes('Only users can upload')) {
      return 'You must be logged in to upload songs.';
    }
    // Generic permission denial
    return 'You do not have permission to perform this action.';
  }

  // Invalid payload errors
  if (errorMessage.includes('Invalid') || errorMessage.includes('invalid')) {
    // Extract the specific validation message if present
    if (errorMessage.includes('Duration must be greater than zero')) {
      return 'Song duration must be greater than zero.';
    }
    if (errorMessage.includes('payload')) {
      return 'Invalid song data. Please check all fields and try again.';
    }
    return errorMessage.length < 100 ? errorMessage : 'Invalid data provided.';
  }

  // Storage errors
  if (errorMessage.includes('storage') || errorMessage.includes('Storage')) {
    return 'A storage error occurred. Please try again.';
  }

  // Subscription errors
  if (errorMessage.includes('Subscription required')) {
    return 'An active subscription is required for this feature.';
  }

  // Not found errors
  if (errorMessage.includes('not found')) {
    return 'The requested item was not found.';
  }

  // Bootstrap errors
  if (errorMessage.includes('Bootstrap')) {
    return 'Admin setup has already been completed.';
  }

  // Invalid Principal errors
  if (errorMessage.includes('Invalid principal') || errorMessage.includes('principal format')) {
    return 'Invalid Principal ID format. Please check and try again.';
  }

  // Actor/connection errors
  if (errorMessage.includes('Actor not available')) {
    return 'Unable to connect to the service. Please try again.';
  }

  // Generic trap errors - strip the raw trap text
  if (errorMessage.includes('trap') || errorMessage.includes('Canister')) {
    // Try to extract meaningful message before "trap" keyword
    const beforeTrap = errorMessage.split(/trap|Canister/i)[0].trim();
    if (beforeTrap && beforeTrap.length > 10 && beforeTrap.length < 150) {
      // Remove common prefixes
      const cleaned = beforeTrap.replace(/^(Error:|Rejected:)\s*/i, '').trim();
      return cleaned;
    }
    return 'An error occurred while processing your request.';
  }

  // Return the original message if it's already user-friendly (short and clear)
  if (errorMessage.length < 100 && !errorMessage.includes('Error:') && !errorMessage.includes('Rejected:')) {
    return errorMessage;
  }

  return 'An error occurred. Please try again.';
}

/**
 * Checks if an error is authorization-related for UI purposes
 */
export function isAuthorizationError(error: any): boolean {
  if (!error) return false;
  const errorMessage = (error.message || String(error)).toLowerCase();
  return errorMessage.includes('unauthorized') || 
         errorMessage.includes('permission') || 
         errorMessage.includes('not have access') ||
         errorMessage.includes('only users can') ||
         errorMessage.includes('admin') && errorMessage.includes('required');
}
