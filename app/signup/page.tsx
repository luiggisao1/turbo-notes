"use client";

import { useState, useActionState, useEffect } from "react";
import Form from "next/form";
import Image from "next/image";
import Link from "next/link";

import { Eye, EyeClosed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { signup } from "@/app/actions/auth";
import { useAuth } from "../lib/auth";
import { useToast } from "../hooks/use-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const auth = useAuth();

  const [state, action, pending] = useActionState(signup, { success: false });

  useEffect(() => {
    const authWithToken = async (access: string, refresh: string) => {
      return auth.loginWithTokens({ access, refresh }, "/");
    };
    if (state.success && !pending) {
      toast({
        title: "Welcome!",
        description: "Your account has been created successfully.",
        duration: 3000,
      });
      authWithToken(state.tokens!.access, state.tokens!.refresh!);
    }
  }, [state, pending]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md px-6">
        <div className="flex flex-col items-center mb-9">
          <Image
            src="/signup-avatar.png"
            alt="Signup Avatar"
            width={150}
            height={150}
          />
          <h1 className="text-4xl inria-serif-bold font-bold text-foreground mb-2 mt-8">
            Yay, New Friend!
          </h1>
        </div>

        <Form action={action} className="space-y-4">
          <div>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="text-xs inter-regular h-10"
            />
            {state?.errors?.email && (
              <p className="text-sm text-red-600 mt-1">{state.errors.email}</p>
            )}
          </div>

          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="text-xs inter-regular h-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? (
                <Eye className="text-foreground" size={20} />
              ) : (
                <EyeClosed className="text-foreground" size={20} />
              )}
            </button>
          </div>
          {state?.errors?.password && (
            <div className="text-sm text-red-600">
              <p>Password must:</p>
              <ul>
                {state.errors.password.map((error) => (
                  <li key={error}>- {error}</li>
                ))}
              </ul>
            </div>
          )}
          {state?.errors?.error && (
            <p className="text-sm text-red-600 mt-1">{state.errors.error}</p>
          )}
          <Button
            className="w-full mt-11 inter-bold text-base h-11"
            type="submit"
            disabled={pending}
          >
            {pending ? "Signing up..." : "Sign Up"}
          </Button>
        </Form>

        <div className="mt-4 text-center">
          <Link
            href="/login"
            className="inter-regular text-primary-accent text-xs text-muted-foreground underline"
          >
            We’re already friends!
          </Link>
        </div>
      </div>
    </div>
  );
}
