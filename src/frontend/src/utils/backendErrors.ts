/**
 * Normalizes backend errors into user-friendly messages.
 * Strips raw trap text and provides clear English error messages.
 */
export function normalizeBackendError(error: any): string {
  if (!error) return 'An unknown error occurred';

  const errorMessage = error.message || String(error);

  // Authorization errors
  if (errorMessage.includes('Unauthorized') || errorMessage.includes('permission')) {
    // Check for explicit admin requirement
    if (errorMessage.toLowerCase().includes('admin') && errorMessage.toLowerCase().includes('only')) {
      return 'You do not have permission to perform this action. Admin access required.';
    }
    // Check for login requirement
    if (errorMessage.includes('logged in') || errorMessage.includes('authenticated')) {
      return 'Please log in to continue.';
    }
    // Generic permission denial - avoid assuming admin-only
    return 'You do not have permission to perform this action.';
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
    if (beforeTrap && beforeTrap.length > 10) {
      return beforeTrap;
    }
    return 'An error occurred while processing your request.';
  }

  // Return the original message if it's already user-friendly
  if (errorMessage.length < 100 && !errorMessage.includes('Error:')) {
    return errorMessage;
  }

  return 'An error occurred. Please try again.';
}
