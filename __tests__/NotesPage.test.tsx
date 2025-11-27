import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

// Mock next/image for any components that use it
vi.mock("next/image", () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    return React.createElement("img", props);
  },
}));

// Mock UI primitives used by the page so they render simple DOM elements
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

// Mock child components used by NotesPage
vi.mock("@/app/_components/EmptyNoteState", () => ({
  __esModule: true,
  EmptyNotesState: () =>
    React.createElement("div", { "data-testid": "empty-notes" }, "EMPTY_NOTES"),
}));

vi.mock("@/app/_components/NoteCard", () => ({
  __esModule: true,
  NoteCard: ({ note, onEdit, onDelete }: any) =>
    React.createElement(
      "div",
      { "data-testid": `note-card-${note.id}` },
      React.createElement("h2", null, note.title),
      React.createElement("button", { onClick: () => onEdit(note) }, "edit"),
      React.createElement("button", { onClick: () => onDelete(note.id) }, "delete")
    ),
}));

vi.mock("@/components/CategorySidebar", () => ({
  __esModule: true,
  CategorySidebar: (props: any) =>
    React.createElement("aside", { "data-testid": "category-sidebar" }, JSON.stringify(props.categoryCounts || {})),
}));

// Mock auth hook used by the page
const mockUseAuth = vi.fn();
vi.mock("@/app/lib/auth", () => ({
  __esModule: true,
  useAuth: () => mockUseAuth(),
}));

// Mock router to observe redirects
const replaceMock = vi.fn();
vi.mock("next/navigation", () => ({
  __esModule: true,
  useRouter: () => ({
    replace: replaceMock,
  }),
}));

// Mock apiClient.fetchWithAuth with a safe default implementation
const fetchWithAuthMock = vi.fn(async (url: string, init?: any) => {
  return { ok: false, status: 404, json: async () => null };
});
vi.mock("@/app/lib/apiClient", () => ({
  __esModule: true,
  default: {
    fetchWithAuth: (url: string, init?: any) => fetchWithAuthMock(url, init),
    logout: vi.fn(),
    getAccessToken: vi.fn(),
  },
}));

// Import the page after mocks are set up
import NotesPage from "@/app/page";

beforeEach(() => {
  vi.clearAllMocks();
  // restore safe default for fetch mock between tests
  fetchWithAuthMock.mockImplementation(async (url: string) => ({ ok: false, status: 404, json: async () => null }));
});

describe("NotesPage", () => {
  it("shows loading when auth.loading is true", () => {
    mockUseAuth.mockReturnValue({ user: null, loading: true });
    render(React.createElement(NotesPage));
    expect(screen.getByText(/Loading\.\.\./i)).toBeInTheDocument();
  });

  it("redirects to /login when not loading and user is null", () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false });
    render(React.createElement(NotesPage));
    expect(replaceMock).toHaveBeenCalledWith("/login");
  });

  it("shows EmptyNotesState when user present and no notes returned", async () => {
    mockUseAuth.mockReturnValue({ user: { id: "u1", email: "u@example.com" }, loading: false });

    // Provide API responses: empty notes list and zero counts
    fetchWithAuthMock.mockImplementation(async (url: string) => {
      if (url.includes("/notes/counts-by-category/")) {
        return { ok: true, json: async () => ({ random: 0, school: 0, personal: 0 }) };
      }
      // notes list fetch
      return { ok: true, json: async () => [] };
    });

    render(React.createElement(NotesPage));

    await waitFor(() => {
      expect(screen.getByTestId("empty-notes")).toBeInTheDocument();
    });
  });

  it("renders notes when API returns notes", async () => {
    mockUseAuth.mockReturnValue({ user: { id: "u2" }, loading: false });

    const notes = [
      { id: "n1", title: "First", content: "a", created_at: new Date().toISOString(), updated_at: null, category: "random" },
      { id: "n2", title: "Second", content: "b", created_at: new Date().toISOString(), updated_at: null, category: "school" },
    ];

    fetchWithAuthMock.mockImplementation(async (url: string) => {
      if (url.includes("/notes/counts-by-category/")) {
        return { ok: true, json: async () => ({ random: 1, school: 1, personal: 0 }) };
      }
      return { ok: true, json: async () => notes };
    });

    render(React.createElement(NotesPage));

    await waitFor(() => {
      expect(screen.getByTestId("note-card-n1")).toBeInTheDocument();
      expect(screen.getByTestId("note-card-n2")).toBeInTheDocument();
    });
  });
});