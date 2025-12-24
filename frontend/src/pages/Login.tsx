import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(username, password);
      if (success) {
        navigate('/dashboard');
      }
      // Note: Les messages d'erreur sont gérés dans AuthContext
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Pre-fill with demo credentials
  const fillDemoCredentials = (type: 'admin' | 'user') => {
    if (type === 'admin') {
      setUsername('admin');
      setPassword('2002');
    } else {
      setUsername('user');
      setPassword('1234');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 sidebar-gradient items-center justify-center p-12">
        <div className="max-w-md text-center">
          <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-8">
            <span className="text-primary-foreground font-bold text-4xl">P</span>
          </div>
          <h1 className="text-4xl font-bold text-sidebar-foreground mb-4">
            ProjectFlow
          </h1>
          <p className="text-sidebar-foreground/80 text-lg">
            Manage your projects and tasks with ease. Stay organized, collaborate
            with your team, and achieve your goals.
          </p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <div className="w-16 h-16 rounded-xl bg-primary flex items-center justify-center mx-auto mb-4">
              <span className="text-primary-foreground font-bold text-2xl">P</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">ProjectFlow</h1>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-foreground">
              Welcome back
            </h2>
            <p className="text-muted-foreground mt-2">
              Sign in to continue to your projects
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="admin or user"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="h-12"
                autoComplete="username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={4}
                className="h-12"
                autoComplete="current-password"
              />
            </div>

            <Button type="submit" className="w-full h-12" disabled={isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              By signing in, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
