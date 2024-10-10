export interface UserInformation {
  uid: string | null; // User ID, could be null if not logged in
  name: string | null; // User's display name
  email: string | null; // User's email address

  // More information
};
