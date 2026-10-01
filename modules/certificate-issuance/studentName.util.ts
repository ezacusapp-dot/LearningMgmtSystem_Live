// Builds a clean full name: "First Middle Last"
// - trims each part
// - skips empty/null parts (so no double spaces when there's no middle name)
export function buildStudentFullName(s: {
  firstName?: string | null;
  middleName?: string | null;
  lastName?: string | null;
}): string {
  return [s.firstName, s.middleName, s.lastName]
    .map((p) => (p ?? "").trim())
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ");
}