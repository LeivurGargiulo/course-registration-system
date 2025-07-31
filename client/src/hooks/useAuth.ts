import { useQuery } from "@tanstack/react-query";

export interface AuthUser {
  id: string;
  username: string;
  email?: string;
  role: 'admin' | 'user';
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
}

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<AuthUser>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    error,
  };
}