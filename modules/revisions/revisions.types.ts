// ============================================================
// revision.types.ts
// ============================================================

/**
 * Frontend sends REVISION module lessons as:
 *   { contentType: "VIDEO", videoLinks: ["https://..."], title, order }
 *
 * These map to RevisionContent where:
 *   contentType = "VIDEO"
 *   fileUrl     = videoLinks[0]
 */

export interface RevisionContentInput {
  contentType: "VIDEO" | "PDF";
  fileUrl?:    string;         // for PDF type
  videoLinks?: string[];       // for VIDEO type — videoLinks[0] → fileUrl
  order:       number;
}

export interface CreateRevisionDto {
  moduleId:  string;
  title?:    string;
  isActive?: boolean;
  contents?: RevisionContentInput[];
}

export interface UpdateRevisionDto {
  title?:    string;
  isActive?: boolean;
  contents?: RevisionContentInput[];
}

/** Shape returned to client — fileUrl expanded back into videoLinks for VIDEO */
export interface RevisionContentResponse {
  id:          string;
  revisionId:  string;
  contentType: "VIDEO" | "PDF";
  fileUrl?:    string | null;
  videoLinks:  string[];
  order:       number;
}