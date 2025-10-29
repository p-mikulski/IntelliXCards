/**
 * Unit tests for AIGenerationForm component
 * Tests validation, user interactions, and form submission
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AIGenerationForm from "./AIGenerationForm";
import type { GenerateFlashcardsCommand } from "@/types";

describe("AIGenerationForm", () => {
  const mockProjectId = "test-project-123";
  const mockOnGenerate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe("Initial Render", () => {
    it("should render all form elements with correct labels", () => {
      render(<AIGenerationForm projectId={mockProjectId} onGenerate={mockOnGenerate} isGenerating={false} />);

      expect(screen.getByLabelText(/source text/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/number of flashcards/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /generate flashcards/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
    });

    it("should show default flashcard count of 5", () => {
      render(<AIGenerationForm projectId={mockProjectId} onGenerate={mockOnGenerate} isGenerating={false} />);

      const countInput = screen.getByLabelText(/number of flashcards/i) as HTMLInputElement;
      expect(countInput.value).toBe("5");
    });

    it("should have submit button disabled when form is empty", () => {
      render(<AIGenerationForm projectId={mockProjectId} onGenerate={mockOnGenerate} isGenerating={false} />);

      const submitButton = screen.getByRole("button", { name: /generate flashcards/i });
      expect(submitButton).toBeDisabled();
    });

    it("should display character counter showing 0 / 10 000", () => {
      render(<AIGenerationForm projectId={mockProjectId} onGenerate={mockOnGenerate} isGenerating={false} />);

      expect(screen.getByText(/0 \/ 10 000/i)).toBeInTheDocument();
    });
  });

  describe("Text Input Validation", () => {
    it("should display validation error when text is empty and user tries to submit", async () => {
      const user = userEvent.setup();
      render(<AIGenerationForm projectId={mockProjectId} onGenerate={mockOnGenerate} isGenerating={false} />);

      const textInput = screen.getByLabelText(/source text/i);
      const submitButton = screen.getByRole("button", { name: /generate flashcards/i });

      // Type something then clear it
      await user.type(textInput, "Some text");
      await user.clear(textInput);

      await waitFor(() => {
        expect(screen.getByText(/text cannot be empty/i)).toBeInTheDocument();
      });

      expect(submitButton).toBeDisabled();
    });

    it("should display validation error when text exceeds 10,000 characters", async () => {
      const user = userEvent.setup();
      render(<AIGenerationForm projectId={mockProjectId} onGenerate={mockOnGenerate} isGenerating={false} />);

      const textInput = screen.getByLabelText(/source text/i) as HTMLTextAreaElement;
      const longText = "a".repeat(10001);

      // Use paste for large text to avoid timeout
      await user.click(textInput);
      await user.paste(longText);

      await waitFor(
        () => {
          expect(screen.getByText(/text must not exceed 10 000 characters/i)).toBeInTheDocument();
        },
        { timeout: 2000 }
      );

      const submitButton = screen.getByRole("button", { name: /generate flashcards/i });
      expect(submitButton).toBeDisabled();
    });

    it("should update character counter as user types", async () => {
      const user = userEvent.setup();
      render(<AIGenerationForm projectId={mockProjectId} onGenerate={mockOnGenerate} isGenerating={false} />);

      const textInput = screen.getByLabelText(/source text/i);
      const testText = "This is a test input for flashcard generation";

      await user.type(textInput, testText);

      await waitFor(() => {
        expect(screen.getByText(new RegExp(`${testText.length} / 10 000`, "i"))).toBeInTheDocument();
      });
    });

    it("should enable submit button when text is valid", async () => {
      const user = userEvent.setup();
      render(<AIGenerationForm projectId={mockProjectId} onGenerate={mockOnGenerate} isGenerating={false} />);

      const textInput = screen.getByLabelText(/source text/i);
      await user.type(textInput, "Valid text for flashcard generation");

      const submitButton = screen.getByRole("button", { name: /generate flashcards/i });

      await waitFor(() => {
        expect(submitButton).toBeEnabled();
      });
    });

    it("should clear error message when user corrects invalid text", async () => {
      const user = userEvent.setup();
      render(<AIGenerationForm projectId={mockProjectId} onGenerate={mockOnGenerate} isGenerating={false} />);

      const textInput = screen.getByLabelText(/source text/i) as HTMLTextAreaElement;

      // First, create an error by typing and then selecting all and deleting
      await user.type(textInput, "Some text");
      await user.tripleClick(textInput);
      await user.keyboard("{Backspace}");

      await waitFor(() => {
        expect(screen.getByText(/text cannot be empty/i)).toBeInTheDocument();
      });

      // Now type valid text
      await user.type(textInput, "Valid text");

      await waitFor(() => {
        expect(screen.queryByText(/text cannot be empty/i)).not.toBeInTheDocument();
      });
    });
  });

  describe("Flashcard Count Validation", () => {
    it("should display validation error when count is less than 1", async () => {
      const user = userEvent.setup();
      render(<AIGenerationForm projectId={mockProjectId} onGenerate={mockOnGenerate} isGenerating={false} />);

      const countInput = screen.getByLabelText(/number of flashcards/i);
      await user.clear(countInput);
      await user.type(countInput, "0");

      await waitFor(() => {
        expect(screen.getByText(/count must be at least 1/i)).toBeInTheDocument();
      });
    });

    it("should display validation error when count exceeds 50", async () => {
      const user = userEvent.setup();
      render(<AIGenerationForm projectId={mockProjectId} onGenerate={mockOnGenerate} isGenerating={false} />);

      const countInput = screen.getByLabelText(/number of flashcards/i);
      await user.clear(countInput);
      await user.type(countInput, "51");

      await waitFor(() => {
        expect(screen.getByText(/count must not exceed 50/i)).toBeInTheDocument();
      });
    });

    it("should accept valid count values between 1 and 50", async () => {
      const user = userEvent.setup();
      render(<AIGenerationForm projectId={mockProjectId} onGenerate={mockOnGenerate} isGenerating={false} />);

      const countInput = screen.getByLabelText(/number of flashcards/i);
      const textInput = screen.getByLabelText(/source text/i);

      // Add valid text
      await user.type(textInput, "Valid text for generation");

      // Test boundary values
      await user.clear(countInput);
      await user.type(countInput, "1");

      await waitFor(() => {
        expect(screen.queryByText(/count must/i)).not.toBeInTheDocument();
      });

      await user.clear(countInput);
      await user.type(countInput, "50");

      await waitFor(() => {
        expect(screen.queryByText(/count must/i)).not.toBeInTheDocument();
      });

      const submitButton = screen.getByRole("button", { name: /generate flashcards/i });
      expect(submitButton).toBeEnabled();
    });

    it("should clear error message when user corrects invalid count", async () => {
      const user = userEvent.setup();
      render(<AIGenerationForm projectId={mockProjectId} onGenerate={mockOnGenerate} isGenerating={false} />);

      const countInput = screen.getByLabelText(/number of flashcards/i);

      // Create error
      await user.clear(countInput);
      await user.type(countInput, "100");

      await waitFor(() => {
        expect(screen.getByText(/count must not exceed 50/i)).toBeInTheDocument();
      });

      // Correct the error
      await user.clear(countInput);
      await user.type(countInput, "10");

      await waitFor(() => {
        expect(screen.queryByText(/count must not exceed 50/i)).not.toBeInTheDocument();
      });
    });
  });

  describe("Form Submission", () => {
    it("should call onGenerate with correct command when form is valid", async () => {
      const user = userEvent.setup();
      render(<AIGenerationForm projectId={mockProjectId} onGenerate={mockOnGenerate} isGenerating={false} />);

      const textInput = screen.getByLabelText(/source text/i) as HTMLTextAreaElement;
      const countInput = screen.getByLabelText(/number of flashcards/i) as HTMLInputElement;
      const submitButton = screen.getByRole("button", { name: /generate flashcards/i });

      const testText = "This is sample text for flashcard generation";

      // Clear and type text
      await user.clear(textInput);
      await user.type(textInput, testText);

      // Clear and set count
      await user.clear(countInput);
      await user.type(countInput, "10");

      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnGenerate).toHaveBeenCalledTimes(1);
        expect(mockOnGenerate).toHaveBeenCalledWith<[GenerateFlashcardsCommand]>({
          text: testText,
          desired_count: 10,
        });
      });
    });

    it("should trim whitespace from text before submission", async () => {
      const user = userEvent.setup();
      render(<AIGenerationForm projectId={mockProjectId} onGenerate={mockOnGenerate} isGenerating={false} />);

      const textInput = screen.getByLabelText(/source text/i) as HTMLTextAreaElement;
      const submitButton = screen.getByRole("button", { name: /generate flashcards/i });

      await user.clear(textInput);
      await user.type(textInput, "   Text with spaces   ");
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnGenerate).toHaveBeenCalledWith(
          expect.objectContaining({
            text: "Text with spaces",
          })
        );
      });
    });

    it("should prevent submission when validation errors exist", async () => {
      const user = userEvent.setup();
      render(<AIGenerationForm projectId={mockProjectId} onGenerate={mockOnGenerate} isGenerating={false} />);

      const textInput = screen.getByLabelText(/source text/i) as HTMLTextAreaElement;
      const countInput = screen.getByLabelText(/number of flashcards/i) as HTMLInputElement;

      // Create invalid state - use paste for large text
      await user.click(textInput);
      await user.paste("a".repeat(10001)); // Too long

      await user.clear(countInput);
      await user.type(countInput, "100"); // Too many

      const submitButton = screen.getByRole("button", { name: /generate flashcards/i });

      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });

      expect(mockOnGenerate).not.toHaveBeenCalled();
    });
  });

  describe("Loading State (isGenerating)", () => {
    it("should show loading UI when isGenerating is true", () => {
      render(<AIGenerationForm projectId={mockProjectId} onGenerate={mockOnGenerate} isGenerating={true} />);

      expect(screen.getByText(/generating\.\.\./i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /generating\.\.\./i })).toBeInTheDocument();
    });

    it("should disable all form inputs when isGenerating is true", () => {
      render(<AIGenerationForm projectId={mockProjectId} onGenerate={mockOnGenerate} isGenerating={true} />);

      const textInput = screen.getByLabelText(/source text/i);
      const countInput = screen.getByLabelText(/number of flashcards/i);
      const submitButton = screen.getByRole("button", { name: /generating\.\.\./i });
      const cancelButton = screen.getByRole("button", { name: /cancel/i });

      expect(textInput).toBeDisabled();
      expect(countInput).toBeDisabled();
      expect(submitButton).toBeDisabled();
      expect(cancelButton).toBeDisabled();
    });

    it("should display loading spinner when isGenerating is true", () => {
      render(<AIGenerationForm projectId={mockProjectId} onGenerate={mockOnGenerate} isGenerating={true} />);

      const spinner = screen.getByRole("button", { name: /generating\.\.\./i }).querySelector(".animate-spin");
      expect(spinner).toBeInTheDocument();
    });
  });

  describe("Cancel Button", () => {
    it("should navigate back to project page when cancel is clicked", async () => {
      const user = userEvent.setup();
      // Mock window.location.href
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (window as any).location;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).location = { href: "" };

      render(<AIGenerationForm projectId={mockProjectId} onGenerate={mockOnGenerate} isGenerating={false} />);

      const cancelButton = screen.getByRole("button", { name: /cancel/i });
      await user.click(cancelButton);

      expect(window.location.href).toBe(`/projects/${mockProjectId}`);
    });
  });

  describe("Accessibility", () => {
    it("should associate error messages with form fields using aria-describedby", async () => {
      const user = userEvent.setup();
      render(<AIGenerationForm projectId={mockProjectId} onGenerate={mockOnGenerate} isGenerating={false} />);

      const textInput = screen.getByLabelText(/source text/i);

      // Trigger error
      await user.type(textInput, "text");
      await user.clear(textInput);

      await waitFor(() => {
        expect(textInput).toHaveAttribute("aria-describedby", expect.stringContaining("text-error"));
      });
    });

    it("should mark required fields with asterisk", () => {
      render(<AIGenerationForm projectId={mockProjectId} onGenerate={mockOnGenerate} isGenerating={false} />);

      const labels = screen.getAllByText("*");
      expect(labels.length).toBeGreaterThan(0);
    });

    it("should have proper form structure for screen readers", () => {
      render(<AIGenerationForm projectId={mockProjectId} onGenerate={mockOnGenerate} isGenerating={false} />);

      const form = screen.getByRole("button", { name: /generate flashcards/i }).closest("form");
      expect(form).toBeInTheDocument();
    });
  });
});
