// import { NextResponse } from "next/server";
// import { 
//   createModuleService, 
//   getModulesService, 
//   updateModuleService, 
//   deleteModuleService 
// } from "./modules.service";
// import { validateModuleInput } from "./modules.validation";

// // ================= CREATE MODULE =================
// export const createModuleController = async (req: Request) => {
//   try {
//     const body = await req.json();

//     // ✅ Full validation
//     const error = validateModuleInput(body);
//     if (error) 
//       return NextResponse.json({ status: false, message: error }, { status: 400 });

//     const module = await createModuleService(body);

//     return NextResponse.json(
//       { status: true, message: "Module Added Successfully", data: module },
//       { status: 201 }
//     );

//   } catch (err: any) {
//     return NextResponse.json({ status: false, message: err.message }, { status: 500 });
//   }
// };

// // ================= GET MODULES =================
// export const getModulesController = async (req: Request) => {
//   try {
//     const url = new URL(req.url);
//     const query = Object.fromEntries(url.searchParams.entries());

//     const result = await getModulesService(query);

//     return NextResponse.json({ status: true, data: result.data, meta: result.meta });

//   } catch (err: any) {
//     return NextResponse.json({ status: false, message: err.message }, { status: 500 });
//   }
// };

// // ================= UPDATE MODULE =================
// export const updateModuleController = async (req: Request, id: string) => {
//   try {
//     if (!id) 
//       return NextResponse.json({ status: false, message: "Module ID is required" }, { status: 400 });

//     const body = await req.json();

//     // ✅ Partial update allowed
//     const validationError = validateModuleInput(body, true);
//     if (validationError) 
//       return NextResponse.json({ status: false, message: validationError }, { status: 400 });

//     const updated = await updateModuleService(id, body);

//     return NextResponse.json({ status: true, message: "Module Updated Successfully", data: updated });

//   } catch (err: any) {
//     return NextResponse.json({ status: false, message: err.message }, { status: 500 });
//   }
// };

// // ================= DELETE MODULE =================
// export const deleteModuleController = async (id: string) => {
//   try {
//     if (!id) 
//       return NextResponse.json({ status: false, message: "Module ID is required" }, { status: 400 });

//     await deleteModuleService(id);

//     return NextResponse.json({ status: true, message: "Module Deleted Successfully" });

//   } catch (err: any) {
//     return NextResponse.json({ status: false, message: err.message }, { status: 500 });
//   }
// };
// ============================================================
// modules.controller.ts
// ============================================================

import {
  getModulesService,
  getModuleByIdService,
  createModuleService,
  updateModuleService,
  deleteModuleService,
} from "./modules.service";
import { validateCreateModule, validateUpdateModule } from "./modules.validation";

export const getModulesController = async (req: Request) => {
  try {
    const { searchParams } = new URL(req.url);
    const result = await getModulesService({
      page:     searchParams.get("page"),
      limit:    searchParams.get("limit"),
      search:   searchParams.get("search"),
      courseId: searchParams.get("courseId"),
      type:     searchParams.get("type"),
    });
    return Response.json({ status: true, ...result });
  } catch (err: any) {
    return Response.json({ status: false, message: err.message }, { status: 500 });
  }
};

export const getModuleByIdController = async (id: string) => {
  try {
    const data = await getModuleByIdService(id);
    return Response.json({ status: true, data });
  } catch (err: any) {
    const status = err.message === "Module not found" ? 404 : 500;
    return Response.json({ status: false, message: err.message }, { status });
  }
};

export const createModuleController = async (req: Request) => {
  try {
    const body      = await req.json();
    const validated = validateCreateModule(body);
    const data      = await createModuleService(validated);
    return Response.json({ status: true, message: "Module Added Successfully", data }, { status: 201 });
  } catch (err: any) {
    return Response.json({ status: false, message: err.message }, { status: 400 });
  }
};

export const updateModuleController = async (req: Request, id: string) => {
  try {
    if (!id) return Response.json({ status: false, message: "Module ID is required" }, { status: 400 });
    const body      = await req.json();
    const validated = validateUpdateModule(body);
    const data      = await updateModuleService(id, validated);
    return Response.json({ status: true, message: "Module Updated Successfully", data });
  } catch (err: any) {
    const status = err.message === "Module not found" ? 404 : 400;
    return Response.json({ status: false, message: err.message }, { status });
  }
};

export const deleteModuleController = async (id: string) => {
  try {
    if (!id) return Response.json({ status: false, message: "Module ID is required" }, { status: 400 });
    await deleteModuleService(id);
    return Response.json({ status: true, message: "Module Deleted Successfully" });
  } catch (err: any) {
    const status = err.message === "Module not found" ? 404 : 500;
    return Response.json({ status: false, message: err.message }, { status });
  }
};