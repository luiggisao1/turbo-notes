import * as z from "zod";

export const SignupFormSchema = z.object({
  email: z.email({ error: "Please enter a valid email." }).trim(),
  password: z
    .string()
    .min(8, { error: "Be at least 8 characters long" })
    .regex(/[a-zA-Z]/, { error: "Contain at least one letter." })
    .regex(/[0-9]/, { error: "Contain at least one number." })
    .regex(/[^a-zA-Z0-9]/, {
      error: "Contain at least one special character.",
    })
    .trim(),
});

export type FormState = {
  success: boolean;
  tokens?: {
    access: string;
    refresh?: string;
  };
  fields?: Record<string, string>;
  errors?: Record<string, string[]>;
};

export type LoginFormState = {
  success: boolean;
  tokens?: {
    access: string;
    refresh?: string;
  };
  error?: string;
};

export const loginSchema = z.object({
  email: z.string().trim(),
  password: z.string().min(1, { error: "Password is required" }),
});
