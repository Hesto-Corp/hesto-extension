export interface AuthState {
  isLoggedIn: boolean; // Indicates if the user is authenticated
  token: string | null; // Optional auth token for the user, could be null
  uid: string | null;
  pending: boolean; // Whether authentication is in progress
  error: string | null; // Any authentication errors
};
