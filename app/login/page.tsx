"use client"

import { useActionState, useEffect, useState } from "react";
import { useAuth } from "@/app/lib/auth";
import Form from 'next/form'
import Image from "next/image";
import Link from 'next/link';

import { Eye, EyeClosed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { login } from '@/app/actions/auth';
import { useToast } from "@/app/hooks/use-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const auth = useAuth();

  const [state, action, pending] = useActionState(login, { success: false });

  useEffect(() => {
    const authWithToken = async (access: string, refresh: string) => {
      return auth.loginWithTokens({ access, refresh }, "/");
    }

    if (state.success && !pending) {
      toast({
        title: "Welcome Back!",
        description: "You have been logged in successfully.",
        duration: 3000,
      });
      authWithToken(state.tokens!.access, state.tokens!.refresh!);
    }
  }, [state, pending]);

  return (
    <div className="min-h-screen flex items-center justify-center font-sans">
      <div className="w-full max-w-md px-6">
        <div className="flex flex-col items-center mb-8">
          <Image src='/cactus.png' alt="Cactus Illustration" width={100} height={100} />
          <h1 className="text-4xl font-serif font-bold text-foreground mb-2">
            Yay, You're Back!
          </h1>
        </div>

        <Form action={action} className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder="Email address"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full h-12 bg-card border-border px-4 font-sans"
            />
          </div>

          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full h-12 bg-card border-border px-4 pr-12 font-sans"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeClosed size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {state?.error && (
            <p className="text-sm text-red-600">{state?.error}</p>
          )}

          <Button
            type="submit"
            disabled={pending}
            className="rounded-4xl w-full h-12 bg-card hover:bg-accent text-foreground border-2 border-border rounded-xl font-sans font-medium transition-all"
          >
            {pending ? "Logging in..." : "Login"}
          </Button>
        </Form>

        <div className="mt-6 text-center">
          <Link
            href="/signup"
            className="text-sm text-muted-foreground hover:text-foreground underline font-sans"
          >
            Oops! I've never been here before
          </Link>
        </div>
      </div>
    </div>
  );
}
