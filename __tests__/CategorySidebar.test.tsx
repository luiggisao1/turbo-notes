import React from "react";
import { expect, test, describe, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { CategorySidebar } from "@/app/_components/CategorySidebar";

describe("CategorySidebar", () => {
  const setup = (overrides = {}) => {
    const onSelectCategory = vi.fn();
    const onLogout = vi.fn();
    const props = {
      selectedCategory: "school",
      onSelectCategory,
      onLogout,
      categoryCounts: { random: 2, school: 0, personal: 1 },
      ...overrides,
    };

    render(<CategorySidebar {...props} />);

    return { props, onSelectCategory, onLogout };
  };

  test("renders category labels and shows counts for categories with > 0", () => {
    setup();

    expect(screen.getByText("All Categories")).toBeInTheDocument();

    // Labels
    expect(screen.getByText("Random Thoughts")).toBeInTheDocument();
    expect(screen.getByText("School")).toBeInTheDocument();
    expect(screen.getByText("Personal")).toBeInTheDocument();

    // Counts: random -> 2, personal -> 1
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();

    // school has 0 so its count should not be rendered
    // (there shouldn't be a "0" sibling next to "School")
    const maybeZero = screen.queryByText("0");
    if (maybeZero) {
      // If a "0" exists anywhere else in the document it is fine,
      // but assert it's not a sibling of the "School" label element.
      const schoolLabel = screen.getByText("School");
      expect(maybeZero).not.toBe(schoolLabel.parentElement?.querySelector("span:last-child"));
    }
  });

  test("clicking 'All Categories' calls onSelectCategory with 'all'", () => {
    const { onSelectCategory } = setup();

    const allHeader = screen.getByText("All Categories");
    fireEvent.click(allHeader);

    expect(onSelectCategory).toHaveBeenCalledTimes(1);
    expect(onSelectCategory).toHaveBeenCalledWith("all");
  });

  test("clicking a category calls onSelectCategory with the category key", () => {
    const { onSelectCategory } = setup();

    const randomLabel = screen.getByText("Random Thoughts");
    // The label is a child inside the clickable span; clicking it should trigger the parent's onClick
    fireEvent.click(randomLabel);

    expect(onSelectCategory).toHaveBeenCalledTimes(1);
    expect(onSelectCategory).toHaveBeenCalledWith("random");
  });

  test("selected category has the 'inter-bold' class applied", () => {
    setup({ selectedCategory: "personal" });

    const personalLabel = screen.getByText("Personal");
    // The label is inside an inner span; its parent element is the clickable wrapper
    const wrapper = personalLabel.parentElement;
    expect(wrapper).toBeTruthy();
    if (wrapper) {
      expect(wrapper.className).toContain("inter-bold");
    }
  });

  test("clicking logout button calls onLogout", () => {
    const { onLogout } = setup();

    // Button contains an icon and the text 'Logout' - use accessible name
    const logoutButton = screen.getByRole("button", { name: /logout/i });
    fireEvent.click(logoutButton);

    expect(onLogout).toHaveBeenCalledTimes(1);
  });
});