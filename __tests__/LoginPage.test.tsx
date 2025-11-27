import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

// Mock next/image so the LoginPage can render the illustration without Next internals
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

// Mock next/form - LoginPage imports Form and uses useActionState
vi.mock("next/form", () => ({
  __esModule: true,
  default: (props: React.ComponentPropsWithoutRef<"form">) => React.createElement("form", props, props.children),
  useActionState: () => [{ success: false }, () => {}, false],
}));

// Mock UI primitives used by the login page
vi.mock("@/components/ui/input", () => ({
  __esModule: true,
  Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => React.createElement("input", { ...props }),
}));

vi.mock("@/components/ui/button", () => ({
  __esModule: true,
  Button: (props: React.ButtonHTMLAttributes<HTMLButtonElement> & { children?: React.ReactNode }) =>
    React.createElement("button", { ...props }, props.children),
}));

// Mock the auth hook the page imports (not used directly in our tests but safe to provide)
const mockUseAuth = vi.fn();
vi.mock("@/app/lib/auth", () => ({
  __esModule: true,
  useAuth: () => mockUseAuth(),
}));

// Mock the toast hook used in the page
vi.mock("@/app/hooks/use-toast", () => ({
  __esModule: true,
  useToast: () => ({ toast: vi.fn() }),
}));

// Import page after setting up mocks so the module picks them up
import LoginPage from "@/app/login/page";

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // ensure useAuth returns a harmless default for the login page
    mockUseAuth.mockReturnValue({ user: null, loading: false });
  });

  it("renders email and password inputs and a submit button", () => {
    render(React.createElement(LoginPage));

    const email = screen.getByPlaceholderText(/Email address/i);
    const password = screen.getByPlaceholderText(/Password/i);
    const submit = screen.getByRole("button", { name: /login/i });

    expect(email).toBeInTheDocument();
    expect(password).toBeInTheDocument();
    expect(submit).toBeInTheDocument();

    // Default password input type should be password
    expect((password as HTMLInputElement).type).toBe("password");
  });

  it("toggles password visibility when the eye button is clicked", () => {
    render(React.createElement(LoginPage));

    const password = screen.getByPlaceholderText(/Password/i) as HTMLInputElement;
    expect(password.type).toBe("password");

    // The page renders a button to toggle visibility. There are multiple buttons on the page
    // (submit and the toggle). Find a button that is not the submit button by filtering text.
    const allButtons = screen.getAllByRole("button");
    const toggleButton = allButtons.find((b) => !/login/i.test(b.textContent || ""));

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

  it("contains a link to the signup page", () => {
    render(React.createElement(LoginPage));

    const signupLink = screen.getByText(/Oops! I've never been here before/i);
    expect(signupLink).toBeInTheDocument();
    // With the mocked next/link, the rendered anchor should have href="/signup"
    expect((signupLink as HTMLAnchorElement).getAttribute("href")).toBe("/signup");
  });
});