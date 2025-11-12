import type { SupabaseClient } from "../../db/supabase.client";
import type { CreateProjectCommand, ProjectDto, UpdateProjectCommand } from "../../types";
import { createProjectSchema, updateProjectSchema } from "../validation/project.schema";

export class ProjectService {
  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * Creates a new project for the current user
   * @throws {Error} If validation fails or database error occurs
   */
  async createProject(command: CreateProjectCommand, userId: string): Promise<ProjectDto> {
    const validatedData = createProjectSchema.parse(command);

    const { data, error } = await this.supabase
      .from("projects")
      .insert({
        ...validatedData,
        user_id: userId,
      })
      .select("*")
      .single();

    if (error) {
      throw new Error(`Failed to create project: ${error.message}`);
    }

    return data;
  }

  /**
   * Lists all projects for the current user
   * @throws {Error} If database error occurs
   */
  async listProjects(
    userId: string,
    page?: number,
    limit?: number
  ): Promise<{ projects: ProjectDto[]; total: number }> {
    let query = this.supabase
      .from("projects")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (page && limit) {
      const offset = (page - 1) * limit;
      query = query.range(offset, offset + limit - 1);
    }

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to list projects: ${error.message}`);
    }

    return {
      projects: data || [],
      total: count || 0,
    };
  }

  /**
   * Gets a project by ID
   * @throws {Error} If database error occurs or project not found
   */
  async getProjectById(projectId: string, userId: string): Promise<ProjectDto> {
    const { data, error } = await this.supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        throw new Error("Project not found");
      }
      throw new Error(`Failed to get project: ${error.message}`);
    }

    return data;
  }

  /**
   * Updates a project by ID
   * @throws {Error} If validation fails or database error occurs
   */
  async updateProject(projectId: string, userId: string, command: UpdateProjectCommand): Promise<ProjectDto> {
    const validatedData = updateProjectSchema.parse(command);

    const { data, error } = await this.supabase
      .from("projects")
      .update(validatedData)
      .eq("id", projectId)
      .eq("user_id", userId)
      .select("*")
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        throw new Error("Project not found");
      }
      throw new Error(`Failed to update project: ${error.message}`);
    }

    return data;
  }

  /**
   * Deletes a project by ID
   * @throws {Error} If database error occurs
   */
  async deleteProject(projectId: string, userId: string): Promise<void> {
    const { error } = await this.supabase.from("projects").delete().eq("id", projectId).eq("user_id", userId);

    if (error) {
      throw new Error(`Failed to delete project: ${error.message}`);
    }
  }
}
