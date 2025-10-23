import type { ProjectListItemDto } from "@/types";

export type ProjectViewModel = ProjectListItemDto & {
  /** 'syncing' for create/update, 'deleting' for delete */
  optimisticState?: "syncing" | "deleting";
  /** Formatted creation date string for display */
  formattedCreatedAt: string;
};
