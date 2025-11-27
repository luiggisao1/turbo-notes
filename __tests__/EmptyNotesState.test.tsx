import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/image", () => {
  return {
    __esModule: true,
    default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
      return React.createElement("img", props);
    },
  };
});

import { EmptyNotesState } from "@/app/_components/EmptyNoteState";

describe("EmptyNotesState", () => {
  it("renders the empty image and message", () => {
    render(<EmptyNotesState />);

    // Image rendered by the mocked next/image should be present with the alt text
    const img = screen.getByAltText(/Bubble tea empty/i);
    expect(img).toBeInTheDocument();

    // The descriptive paragraph should be visible
    const message = screen.getByText(/I'm just here waiting for your charming notes.../i);
    expect(message).toBeInTheDocument();
  });
});