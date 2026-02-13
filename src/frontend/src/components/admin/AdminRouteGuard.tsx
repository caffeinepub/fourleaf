import { ReactNode } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useIsCallerAdmin } from '../../hooks/useQueries';
import { AlertCircle, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface AdminRouteGuardProps {
  children: ReactNode;
}

export default function AdminRouteGuard({ children }: AdminRouteGuardProps) {
  const { identity, login, loginStatus } = useInternetIdentity();
  const { data: isAdmin, isLoading } = useIsCallerAdmin();
  const navigate = useNavigate();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  if (!isAuthenticated) {
    return (
      <div className="container max-w-2xl py-16">
        <Card className="border-destructive/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-destructive" />
              <CardTitle>Login Required</CardTitle>
            </div>
            <CardDescription>
              You must be logged in to access the admin dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-3">
            <Button onClick={login} disabled={isLoggingIn}>
              {isLoggingIn ? 'Logging in...' : 'Login'}
            </Button>
            <Button variant="outline" onClick={() => navigate({ to: '/' })}>
              Go to Library
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container max-w-2xl py-16">
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Checking permissions...
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container max-w-2xl py-16">
        <Card className="border-destructive/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <ShieldAlert className="h-6 w-6 text-destructive" />
              <CardTitle>Access Denied</CardTitle>
            </div>
            <CardDescription>
              You do not have administrator privileges to access this area. Only admins can upload and manage songs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => navigate({ to: '/' })}>
              Go to Library
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
