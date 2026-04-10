export type UserProfilePreview = {
  name: string;
  email: string;
  avatarUrl: string | null;
};

export const MOCK_USER_PROFILE: UserProfilePreview = {
  name: 'Ricardo Gomez',
  email: 'ricardo.gomez@gmail.com',
  avatarUrl: null,
};

export function greetingFirstNames(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'Usuario';
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[1]}`;
}