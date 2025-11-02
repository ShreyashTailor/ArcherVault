import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Home } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

interface LoginFormProps {
  onLogin: (username: string, password: string) => void;
  onGetKey?: () => void;
  onHome?: () => void;
}

export default function LoginForm({ onLogin, onGetKey, onHome }: LoginFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(username, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="absolute top-4 right-4 flex items-center gap-2">
        {onHome && (
          <Button
            size="icon"
            variant="ghost"
            onClick={onHome}
            data-testid="button-home"
          >
            <Home className="h-5 w-5" />
          </Button>
        )}
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md">
        <div className="backdrop-blur-xl bg-white/80 dark:bg-black/40 border border-border rounded-lg p-8 shadow-lg">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-semibold text-foreground">Archer</h1>
            <p className="text-sm text-muted-foreground mt-2">Educational Platform</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                data-testid="input-username"
                className="transition-all duration-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Access Key
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your access key"
                required
                data-testid="input-password"
                className="transition-all duration-200"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              data-testid="button-login"
            >
              Sign In
            </Button>
          </form>

          {onGetKey && (
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Don't have a key?
              </p>
              <Button
                variant="ghost"
                onClick={onGetKey}
                data-testid="button-get-key"
                className="text-primary"
              >
                Get one here →
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
