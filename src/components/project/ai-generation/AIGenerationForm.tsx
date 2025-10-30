/**
 * AIGenerationForm component
 * Form for inputting text and specifying the number of flashcards to generate
 */

import { useState, type FormEvent, type ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import type { AIGenerationFormProps } from "./types";
import type { GenerateFlashcardsCommand } from "@/types";

const MAX_TEXT_LENGTH = 10000;
const MAX_TEXT_LENGTH_FORMATTED = MAX_TEXT_LENGTH.toLocaleString("en-US").replace(/,/g, " ");
const MIN_FLASHCARD_COUNT = 1;
const MAX_FLASHCARD_COUNT = 50;

export default function AIGenerationForm({ projectId, onGenerate, isGenerating }: AIGenerationFormProps) {
  const [text, setText] = useState("");
  const [desiredCount, setDesiredCount] = useState(5);
  const [textError, setTextError] = useState<string | null>(null);
  const [countError, setCountError] = useState<string | null>(null);

  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setText(value);

    // Validate text length
    if (value.length > MAX_TEXT_LENGTH) {
      setTextError(`Text must not exceed ${MAX_TEXT_LENGTH_FORMATTED} characters`);
    } else if (value.length === 0) {
      setTextError("Text cannot be empty");
    } else {
      setTextError(null);
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Final validation before submit
    if (!text.trim()) {
      setTextError("Text cannot be empty");
      return;
    }

    if (text.length > MAX_TEXT_LENGTH) {
      setTextError(`Text must not exceed ${MAX_TEXT_LENGTH_FORMATTED} characters`);
      return;
    }

    if (desiredCount < MIN_FLASHCARD_COUNT || desiredCount > MAX_FLASHCARD_COUNT) {
      setCountError(`Count must be between ${MIN_FLASHCARD_COUNT} and ${MAX_FLASHCARD_COUNT}`);
      return;
    }

    const command: GenerateFlashcardsCommand = {
      text: text.trim(),
      desired_count: desiredCount,
    };

    onGenerate(command);
  };

  const handleCancel = () => {
    window.location.href = `/projects/${projectId}`;
  };

  const isFormValid =
    text.trim().length > 0 &&
    text.length <= MAX_TEXT_LENGTH &&
    desiredCount >= MIN_FLASHCARD_COUNT &&
    desiredCount <= MAX_FLASHCARD_COUNT &&
    !textError &&
    !countError;

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Generate Flashcards with AI</CardTitle>
          <CardDescription>
            Paste your text below and specify how many flashcards you&apos;d like to generate. Our AI will create
            flashcards based on the key concepts in your text.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Text Input */}
            <div className="space-y-2">
              <Label htmlFor="text">
                Source Text
                <span className="text-destructive ml-1">*</span>
              </Label>
              <Textarea
                id="text"
                className="min-h-60"
                value={text}
                onChange={handleTextChange}
                placeholder="Paste your study material here..."
                rows={12}
                disabled={isGenerating}
                aria-describedby="text-error text-counter"
              />
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  {textError && (
                    <p id="text-error" className="text-sm text-destructive">
                      {textError}
                    </p>
                  )}
                </div>
                <p
                  id="text-counter"
                  className={`text-sm ${text.length > MAX_TEXT_LENGTH ? "text-destructive" : "text-muted-foreground"}`}
                >
                  {text.length} / {MAX_TEXT_LENGTH_FORMATTED}
                </p>
              </div>
            </div>

            {/* Flashcard Count Input */}
            <div className="space-y-2">
              <Label htmlFor="desiredCount">
                Number of Flashcards
                <span className="text-destructive ml-1">*</span>
              </Label>
              <div className="flex items-center gap-4">
                <Slider
                  id="desiredCount"
                  value={[desiredCount]}
                  onValueChange={(value) => {
                    const val = value[0];
                    setDesiredCount(val);
                    if (val < MIN_FLASHCARD_COUNT) {
                      setCountError(`Count must be at least ${MIN_FLASHCARD_COUNT}`);
                    } else if (val > MAX_FLASHCARD_COUNT) {
                      setCountError(`Count must not exceed ${MAX_FLASHCARD_COUNT}`);
                    } else {
                      setCountError(null);
                    }
                  }}
                  min={MIN_FLASHCARD_COUNT}
                  max={MAX_FLASHCARD_COUNT}
                  step={1}
                  disabled={isGenerating}
                  className="flex-1"
                />
                <span className="text-sm font-medium min-w-[1rem]">{desiredCount}</span>
              </div>
              {countError && (
                <p id="count-error" className="text-sm text-destructive">
                  {countError}
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                Recommended: {MIN_FLASHCARD_COUNT}-{MAX_FLASHCARD_COUNT} flashcards
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end">
              <Button type="button" variant="outline" onClick={handleCancel} disabled={isGenerating}>
                Cancel
              </Button>
              <Button type="submit" disabled={!isFormValid || isGenerating}>
                {isGenerating ? (
                  <>
                    <span className="mr-2">Generating...</span>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  </>
                ) : (
                  "Generate Flashcards"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
