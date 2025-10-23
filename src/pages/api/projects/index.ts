import type { APIRoute } from "astro";
import { ProjectService } from "../../../lib/services/project.service";
import type { ErrorResponseDto, ValidationErrorResponseDto } from "../../../types";
import { createProjectSchema } from "../../../lib/validation/project.schema";
import { ZodError } from "zod";
import { DEFAULT_USER_ID } from "../../../db/supabase.client";

export const prerender = false;

/**
 * POST /api/projects
 * Creates a new project
 */
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Parse and validate request body
    const requestData = await request.json();
    const validatedData = createProjectSchema.parse(requestData);

    // Create project
    const projectService = new ProjectService(locals.supabase);
    const project = await projectService.createProject(validatedData, DEFAULT_USER_ID);

    return new Response(JSON.stringify(project), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      const fieldErrors = Object.fromEntries(
        Object.entries(error.flatten().fieldErrors)
          .filter(([, value]) => value !== undefined)
          .map(([key, value]) => [key, value])
      ) as Record<string, string[]>;

      return new Response(
        JSON.stringify({
          error: "Validation Error",
          message: "Invalid request data",
          statusCode: 400,
          details: {
            fields: fieldErrors,
          },
        } satisfies ValidationErrorResponseDto),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    console.error("Error creating project:", error); // eslint-disable-line no-console
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: "Failed to create project",
        statusCode: 500,
      } satisfies ErrorResponseDto),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

/**
 * GET /api/projects
 * Lists all projects for the current user
 */
export const GET: APIRoute = async ({ locals, url }) => {
  try {
    // Parse query parameters for pagination
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");

    // Get all projects for the user (for now, ignoring pagination)
    const projectService = new ProjectService(locals.supabase);
    const projects = await projectService.listProjects(DEFAULT_USER_ID);

    // For now, return all projects with basic pagination info
    const response = {
      projects,
      page,
      limit,
      total: projects.length,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error listing projects:", error); // eslint-disable-line no-console
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: "Failed to list projects",
        statusCode: 500,
      } satisfies ErrorResponseDto),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
