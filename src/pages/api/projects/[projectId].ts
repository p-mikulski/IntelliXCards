import type { APIRoute } from "astro";
import { ProjectService } from "../../../lib/services/project.service";
import type { ErrorResponseDto, ValidationErrorResponseDto } from "../../../types";
import { updateProjectSchema } from "../../../lib/validation/project.schema";
import { ZodError } from "zod";

export const prerender = false;

/**
 * GET /api/projects/[projectId]
 * Get a single project by ID
 */
export const GET: APIRoute = async ({ locals, params }) => {
  if (!params.projectId) {
    return new Response(
      JSON.stringify({
        error: "Bad Request",
        message: "Project ID is required",
        statusCode: 400,
      } satisfies ErrorResponseDto),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  if (!locals.user) {
    return new Response(
      JSON.stringify({
        error: "Unauthorized",
        message: "You must be logged in",
        statusCode: 401,
      } satisfies ErrorResponseDto),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    const projectService = new ProjectService(locals.supabase);
    const project = await projectService.getProjectById(params.projectId, locals.user.id);

    return new Response(JSON.stringify(project), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Project not found") {
      return new Response(
        JSON.stringify({
          error: "Not Found",
          message: "Project not found",
          statusCode: 404,
        } satisfies ErrorResponseDto),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    console.error("Error getting project:", error);
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: "Failed to get project",
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
 * PATCH /api/projects/[projectId]
 * Update a project by ID
 */
export const PATCH: APIRoute = async ({ request, locals, params }) => {
  if (!params.projectId) {
    return new Response(
      JSON.stringify({
        error: "Bad Request",
        message: "Project ID is required",
        statusCode: 400,
      } satisfies ErrorResponseDto),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  if (!locals.user) {
    return new Response(
      JSON.stringify({
        error: "Unauthorized",
        message: "You must be logged in",
        statusCode: 401,
      } satisfies ErrorResponseDto),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    const requestData = await request.json();
    const validatedData = updateProjectSchema.parse(requestData);

    const projectService = new ProjectService(locals.supabase);
    const project = await projectService.updateProject(params.projectId, locals.user.id, validatedData);

    return new Response(JSON.stringify(project), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      const fieldErrors = Object.fromEntries(
        Object.entries(error.flatten().fieldErrors).map(([key, value]) => [key, value || []])
      );

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

    if (error instanceof Error && error.message === "Project not found") {
      return new Response(
        JSON.stringify({
          error: "Not Found",
          message: "Project not found",
          statusCode: 404,
        } satisfies ErrorResponseDto),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    console.error("Error updating project:", error);
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: "Failed to update project",
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
 * DELETE /api/projects/[projectId]
 * Delete a project by ID
 */
export const DELETE: APIRoute = async ({ locals, params }) => {
  if (!params.projectId) {
    return new Response(
      JSON.stringify({
        error: "Bad Request",
        message: "Project ID is required",
        statusCode: 400,
      } satisfies ErrorResponseDto),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  if (!locals.user) {
    return new Response(
      JSON.stringify({
        error: "Unauthorized",
        message: "You must be logged in",
        statusCode: 401,
      } satisfies ErrorResponseDto),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    const projectService = new ProjectService(locals.supabase);
    await projectService.deleteProject(params.projectId, locals.user.id);

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting project:", error);
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: "Failed to delete project",
        statusCode: 500,
      } satisfies ErrorResponseDto),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
