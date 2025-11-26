import { SignupFormSchema, FormState, loginSchema } from '@/lib/definitions'
import { redirect, useRouter } from 'next/navigation';
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
  await new Promise(resolve => setTimeout(resolve, 1500));

  try {
    const res = await fetch("http://localhost:8000/auth/register/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: parsed.data.email, password: parsed.data.password }),
    });
    const data = await res.json();
    await apiClient.setTokens({ access: data.access, refresh: data.refresh });
    return { success: true, tokens: { access: data.access, refresh: data.refresh } };
  } catch (error) {
    return { success: false, errors: { error: ["Login failed"] } };
  }
}

export async function login(state: FormState, payload: FormData): Promise<FormState> {
  if (!(payload instanceof FormData)) {
    return {
      success: false,
      errors: { error: ["Invalid Form Data"] },
    };
  }
  const formData = Object.fromEntries(payload);

  const parsed = loginSchema.safeParse(formData);

  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    const fields: Record<string, string> = {};

    for (const key of Object.keys(formData)) {
      fields[key] = formData[key].toString();
    }
    console.log("Login parse errors:", errors);
    return {
      success: false,
      fields,
      errors,
    };
  }

  await new Promise(resolve => setTimeout(resolve, 1500));

  try {
    const res = await fetch("http://localhost:8000/auth/login/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: parsed.data.email, password: parsed.data.password }),
    });
    const data = await res.json();
    await apiClient.setTokens({ access: data.access, refresh: data.refresh });
    return { success: true, tokens: { access: data.access, refresh: data.refresh } };
  } catch (error) {
    return { success: false, errors: { error: ["Login failed"] } };
  }
}

