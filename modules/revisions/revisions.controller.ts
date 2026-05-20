// ============================================================
// revision.controller.ts
// ============================================================

import {
  getRevisionsService,
  getRevisionByIdService,
  createRevisionService,
  updateRevisionService,
  deleteRevisionService,
  addRevisionContentService,
  updateRevisionContentService,
  deleteRevisionContentService,
} from "./revisions.service";
import {
  validateCreateRevision,
  validateUpdateRevision,
  validateUpdateRevisionContent,
} from "./revisions.validation";

// ================= GET ALL REVISIONS =================
export const getRevisionsController = async (req: Request) => {
  try {
    const { searchParams } = new URL(req.url);

    const query = {
      page:      searchParams.get("page"),
      limit:     searchParams.get("limit"),
      search:    searchParams.get("search"),
      moduleId:  searchParams.get("moduleId"),
    };

    const result = await getRevisionsService(query);

    return Response.json({ status: true, ...result });
  } catch (err: any) {
    return Response.json(
      { status: false, message: err.message },
      { status: 500 }
    );
  }
};

// ================= GET REVISION BY ID =================
export const getRevisionByIdController = async (id: string) => {
  try {
    const data = await getRevisionByIdService(id);

    return Response.json({ status: true, data });
  } catch (err: any) {
    const status = err.message === "Revision not found" ? 404 : 500;
    return Response.json({ status: false, message: err.message }, { status });
  }
};

// ================= CREATE REVISION =================
export const createRevisionController = async (req: Request) => {
  try {
    const body = await req.json();
    const validated = validateCreateRevision(body);

    const data = await createRevisionService(validated);

    return Response.json(
      { status: true, message: "Revision Added Successfully", data },
      { status: 201 }
    );
  } catch (err: any) {
    return Response.json(
      { status: false, message: err.message },
      { status: 400 }
    );
  }
};

// ================= UPDATE REVISION =================
export const updateRevisionController = async (req: Request, id: string) => {
  try {
    if (!id)
      return Response.json(
        { status: false, message: "Revision ID is required" },
        { status: 400 }
      );

    const body = await req.json();
    const validated = validateUpdateRevision(body);

    const data = await updateRevisionService(id, validated);

    return Response.json({
      status: true,
      message: "Revision Updated Successfully",
      data,
    });
  } catch (err: any) {
    const status = err.message === "Revision not found" ? 404 : 400;
    return Response.json({ status: false, message: err.message }, { status });
  }
};

// ================= DELETE REVISION =================
export const deleteRevisionController = async (id: string) => {
  try {
    if (!id)
      return Response.json(
        { status: false, message: "Revision ID is required" },
        { status: 400 }
      );

    await deleteRevisionService(id);

    return Response.json({ status: true, message: "Revision Deleted Successfully" });
  } catch (err: any) {
    const status = err.message === "Revision not found" ? 404 : 500;
    return Response.json({ status: false, message: err.message }, { status });
  }
};

// ============================================================
// REVISION CONTENT CONTROLLERS
// ============================================================

// ================= ADD CONTENT =================
export const addRevisionContentController = async (
  req: Request,
  revisionId: string
) => {
  try {
    if (!revisionId)
      return Response.json(
        { status: false, message: "Revision ID is required" },
        { status: 400 }
      );

    const body = await req.json();

    // Inline validate single content item
     const { z } = await import("zod");

const schema = z.object({
  contentType: z.enum(["VIDEO", "PDF"]),

  fileUrl: z.string().min(1, {
    message: "File URL is required",
  }),

  order: z.coerce.number().min(1, {
    message: "Order is required",
  }),
});

    const validated = schema.parse(body);
    const data = await addRevisionContentService(revisionId, validated);

    return Response.json(
      { status: true, message: "Content Added Successfully", data },
      { status: 201 }
    );
  } catch (err: any) {
    return Response.json(
      { status: false, message: err.message },
      { status: 400 }
    );
  }
};

// ================= UPDATE CONTENT =================
export const updateRevisionContentController = async (
  req: Request,
  contentId: string
) => {
  try {
    if (!contentId)
      return Response.json(
        { status: false, message: "Content ID is required" },
        { status: 400 }
      );

    const body = await req.json();
    const validated = validateUpdateRevisionContent(body);

    const data = await updateRevisionContentService(contentId, validated);

    return Response.json({
      status: true,
      message: "Content Updated Successfully",
      data,
    });
  } catch (err: any) {
    const status = err.message === "Revision content not found" ? 404 : 400;
    return Response.json({ status: false, message: err.message }, { status });
  }
};

// ================= DELETE CONTENT =================
export const deleteRevisionContentController = async (contentId: string) => {
  try {
    if (!contentId)
      return Response.json(
        { status: false, message: "Content ID is required" },
        { status: 400 }
      );

    await deleteRevisionContentService(contentId);

    return Response.json({
      status: true,
      message: "Content Deleted Successfully",
    });
  } catch (err: any) {
    const status = err.message === "Revision content not found" ? 404 : 500;
    return Response.json({ status: false, message: err.message }, { status });
  }
};
