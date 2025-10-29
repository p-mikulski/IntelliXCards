import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import EmptyState from "@/components/common/EmptyState";

describe("EmptyState", () => {
  it("should render title and description", () => {
    const handleAction = vi.fn();

    render(
      <EmptyState
        title="No items found"
        description="Try creating a new item"
        actionText="Create"
        onAction={handleAction}
      />
    );

    expect(screen.getByText("No items found")).toBeInTheDocument();
    expect(screen.getByText("Try creating a new item")).toBeInTheDocument();
  });

  it("should render action button when provided", () => {
    const handleClick = vi.fn();

    render(<EmptyState title="No items" description="Create one" actionText="Create Item" onAction={handleClick} />);

    const button = screen.getByRole("button", { name: /create item/i });
    expect(button).toBeInTheDocument();
  });
});
