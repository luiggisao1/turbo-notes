import { SignupFormSchema, FormState, loginSchema, LoginFormState } from '@/lib/definitions'
import apiClient from '@/app/lib/apiClient';

export async function signup(state: FormState, payload: FormData): Promise<FormState> {
  if (!(payload instanceof FormData)) {
    return {
      success: false,
      errors: { error: ["Invalid Form Data"] },
    };
  }
  const formData = Object.fromEntries(payload);

  const parsed = SignupFormSchema.safeParse(formData);

  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    const fields: Record<string, string> = {};

    for (const key of Object.keys(formData)) {
      fields[key] = formData[key].toString();
    }

    return {
      success: false,
      fields,
      errors,
    };
  }

  try {
    const res = await fetch("http://localhost:8000/auth/register/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: parsed.data.email, password: parsed.data.password }),
    });
    const data = await res.json();
    await apiClient.setTokens({ access: data.access, refresh: data.refresh });
    return { success: !data.error, tokens: { access: data.access, refresh: data.refresh }, errors: data.error ? { error: [data.error] } : undefined };
  } catch (error) {
    return { success: false, errors: { error: ["Signup failed"] } };
  }
}

export async function login(state: LoginFormState, payload: FormData): Promise<LoginFormState> {
  if (!(payload instanceof FormData)) {
    return {
      success: false,
    };
  }
  const formData = Object.fromEntries(payload);

  const parsed = loginSchema.safeParse(formData);

  if (!parsed.success) {
    const fields: Record<string, string> = {};

    for (const key of Object.keys(formData)) {
      fields[key] = formData[key].toString();
    }

    return {
      success: false,
    };
  }

  try {
    const res = await fetch("http://localhost:8000/auth/login/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: parsed.data.email, password: parsed.data.password }),
    });
    const data = await res.json();
    await apiClient.setTokens({ access: data.access, refresh: data.refresh });
    return { success: !data.error, tokens: { access: data.access, refresh: data.refresh }, error: data.error };
  } catch (error) {
    return { success: false, error: "Login failed" };
  }
}

