/**
 * Utility function to exclude password from user objects
 * @param user The user object containing a password field
 * @returns A new user object with the password field excluded
 */
export function excludePassword(user: any) {
  if (!user) return user;
  
  // Create a new object without the password field
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}
