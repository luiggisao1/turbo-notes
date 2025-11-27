import { vi } from "vitest";
// Mock React's useActionState before importing React. Tests control `mockUseActionState`.
const mockUseActionState = vi.fn();
vi.mock("react", async () => {
  const actual = await vi.importActual("react");
  return {
    __esModule: true,
    ...actual,
    useActionState: () => mockUseActionState(),
  };
});

import React from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// Mock next/image so the SignupPage can render the illustration without Next internals
vi.mock("next/image", () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => React.createElement("img", props),
}));

// Mock next/link so Link renders as a simple anchor tag
vi.mock("next/link", () => ({
  __esModule: true,
  default: ({ href, children }: { href?: string; children?: React.ReactNode }) =>
    React.createElement("a", { href }, children),
}));

// Provide a controllable mock implementation for useActionState from next/form.
// Tests will set `mockUseActionState`'s return value in each test.
vi.mock("next/form", () => ({
  __esModule: true,
  default: ({ children, ...props }: { children?: React.ReactNode } & Record<string, unknown>) =>
    React.createElement("form", props as Record<string, unknown>, children),
  useActionState: () => mockUseActionState(),
}));

// Mock UI primitives used by the signup page
vi.mock("@/components/ui/input", () => ({
  __esModule: true,
  Input: (props: React.InputHTMLAttributes<HTMLInputElement>) =>
    React.createElement("input", { ...props }),
}));

vi.mock("@/components/ui/button", () => ({
  __esModule: true,
  Button: (props: React.ButtonHTMLAttributes<HTMLButtonElement> & { children?: React.ReactNode }) =>
    React.createElement("button", { ...props }, props.children),
}));

// Mock the auth hook the page imports. Make it controllable via mockUseAuth.
const mockUseAuth = vi.fn();
vi.mock("@/app/lib/auth", () => ({
  __esModule: true,
  useAuth: () => mockUseAuth(),
}));

// Mock the toast hook used in the page
const mockToast = vi.fn();
vi.mock("@/app/hooks/use-toast", () => ({
  __esModule: true,
  useToast: () => ({ toast: mockToast }),
}));

// Import the page after mocks are set up so the module picks them up
import SignupPage from "@/app/signup/page";

describe("SignupPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // default useActionState: no success, no errors, not pending
    mockUseActionState.mockReturnValue([{ success: false }, () => {}, false]);

    // default auth: no user, not loading, loginWithTokens spy
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      loginWithTokens: vi.fn(),
    });

    // ensure toast mock is reset
    mockToast.mockReset();
  });

  it("renders email and password inputs and a submit button", () => {
    render(React.createElement(SignupPage));

    const email = screen.getByPlaceholderText(/Email address/i);
    const password = screen.getByPlaceholderText(/Password/i);
    const submit = screen.getByRole("button", { name: /sign up/i });

    expect(email).toBeInTheDocument();
    expect(password).toBeInTheDocument();
    expect(submit).toBeInTheDocument();

    // Default password input type should be password
    expect((password as HTMLInputElement).type).toBe("password");
  });

  it("toggles password visibility when the eye button is clicked", () => {
    render(React.createElement(SignupPage));

    const password = screen.getByPlaceholderText(/Password/i) as HTMLInputElement;
    expect(password.type).toBe("password");

    // There are multiple buttons on the page (submit and visibility toggle).
    // Find a button that is not the submit button by filtering text content.
    const allButtons = screen.getAllByRole("button");
    const toggleButton = allButtons.find((b) => !/sign up/i.test(b.textContent || ""));

    expect(toggleButton).toBeTruthy();

    if (toggleButton) {
      // Click to reveal password
      fireEvent.click(toggleButton);
      expect(password.type).toBe("text");

      // Click again to hide
      fireEvent.click(toggleButton);
      expect(password.type).toBe("password");
    }
  });

  it("contains a link to the login page", () => {
    render(React.createElement(SignupPage));

    const loginLink = screen.getByText(/We’re already friends!/i);
    expect(loginLink).toBeInTheDocument();
    // With the mocked next/link, the rendered anchor should have href="/login"
    expect((loginLink as HTMLAnchorElement).getAttribute("href")).toBe("/login");
  });

  it("shows validation and generic errors coming from state.errors", () => {
    // Provide an errors object via useActionState
    const errors = {
      email: "Invalid email provided",
      password: ["Must be at least 8 characters", "Must include a number"],
      error: "Something went wrong",
    };
    mockUseActionState.mockReturnValue([{ success: false, errors }, () => {}, false]);

    render(React.createElement(SignupPage));

    // Email field error
    expect(screen.getByText(errors.email)).toBeInTheDocument();

    // Password list items should be rendered
    expect(screen.getByText(/Must be at least 8 characters/i)).toBeInTheDocument();
    expect(screen.getByText(/Must include a number/i)).toBeInTheDocument();

    // Generic error
    expect(screen.getByText(errors.error)).toBeInTheDocument();
  });

  it("calls toast and auth.loginWithTokens when signup succeeds", async () => {
    const tokens = { access: "access-token", refresh: "refresh-token" };
    // When success is true and pending is false, the useEffect should fire toast and loginWithTokens
    mockUseActionState.mockReturnValue([{ success: true, tokens }, () => {}, false]);

    const loginWithTokens = vi.fn();
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      loginWithTokens,
    });

    render(React.createElement(SignupPage));

    // Wait for the effect to run and the mocked functions to be called
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalled();
      expect(loginWithTokens).toHaveBeenCalledWith(tokens, "/");
    });
  });
});