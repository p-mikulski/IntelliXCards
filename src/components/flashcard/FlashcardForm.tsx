import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createFlashcardSchema } from "@/lib/validation/flashcard.schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { CreateFlashcardCommand } from "@/types";

interface FlashcardFormProps {
  onSubmit: (data: CreateFlashcardCommand) => void;
  onCancel: () => void;
  initialData?: CreateFlashcardCommand;
  isSubmitting?: boolean;
}

/**
 * Form component for creating/editing flashcards
 * Uses react-hook-form with zod validation
 */
export default function FlashcardForm({ onSubmit, onCancel, initialData, isSubmitting = false }: FlashcardFormProps) {
  const form = useForm<CreateFlashcardCommand>({
    resolver: zodResolver(createFlashcardSchema),
    defaultValues: initialData || {
      front: "",
      back: "",
    },
  });

  const handleSubmit = (data: CreateFlashcardCommand) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="front"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold">Front</FormLabel>
              <FormControl>
                <Textarea
                  className="min-h-[80px] placeholder:text-sidebar-foreground"
                  placeholder="Enter the question or prompt"
                  maxLength={200}
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <p className="text-xs text-gray-500 mt-1">{field.value?.length || 0} / 200 characters</p>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="back"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold">Back</FormLabel>
              <FormControl>
                <Textarea
                  className="min-h-[160px] placeholder:text-sidebar-foreground"
                  placeholder="Enter the answer or explanation"
                  maxLength={500}
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <p className="text-xs text-gray-500 mt-1">{field.value?.length || 0} / 500 characters</p>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
