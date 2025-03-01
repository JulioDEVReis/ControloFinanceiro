import { useState } from "react";
import { useAuth } from "./AuthProvider";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Label } from "../ui/label";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    console.log("Attempting to sign in/up with:", { email, isSignUp });

    try {
      if (isSignUp) {
        await signUp(email, password);
        setError("Account created! You can now sign in.");
        setIsSignUp(false);
      } else {
        const data = await signIn(email, password);
        if (data?.session) {
          console.log("Sign in successful");
          window.location.href = "/";
        } else {
          setError("Failed to sign in. Please try again.");
        }
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      setError(error.message || "An error occurred during authentication");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md p-8 bg-white">
        <h2 className="text-2xl font-bold text-center mb-6">
          {isSignUp ? "Create Account" : "Welcome Back"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button type="submit" className="w-full">
            {isSignUp ? "Sign Up" : "Sign In"}
          </Button>

          <p className="text-center text-sm">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-blue-600 hover:underline"
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
          </p>
        </form>
      </Card>
    </div>
  );
}
