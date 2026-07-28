// // lib/certificateMaster.ts

// export interface CertificateMasterRow {
//   id: number;
//   certificateName: string; // e.g. "Arambh", "Pragyan", "Utkarsh", "Shikhar"
//   designation: string;     // e.g. "Pass", "First Division", "Honours / Achiever"
//   colorCode: string;       // hex color used for the certificate's border/accent
//   percentageFrom: number;  // inclusive lower bound
//   percentageTo: number;    // inclusive upper bound
// }

// /**
//  * Default certificate master data. Seeds the JSON store / DB the first
//  * time the admin master page is opened, and is used as a fallback if
//  * the API can't be reached.
//  */
// export const DEFAULT_CERTIFICATE_MASTER: CertificateMasterRow[] = [
//   {
//     id: 1,
//     certificateName: "Fail",
//     designation: "Fail",
//     colorCode: "#8C8C8C",
//     percentageFrom: 0,
//     percentageTo: 49.99,
//   },
//   {
//     id: 2,
//     certificateName: "Arambh",
//     designation: "Pass",
//     colorCode: "#3C0061",
//     percentageFrom: 50,
//     percentageTo: 59.99,
//   },
//   {
//     id: 3,
//     certificateName: "Pragyan",
//     designation: "First Division",
//     colorCode: "#CE8946",
//     percentageFrom: 60,
//     percentageTo: 74.99,
//   },
//   {
//     id: 4,
//     certificateName: "Utkarsh",
//     designation: "Second Division",
//     colorCode: "#C4C4C4",
//     percentageFrom: 75,
//     percentageTo: 89.99,
//   },
//   {
//     id: 5,
//     certificateName: "Shikhar",
//     designation: "Honours / Achiever",
//     colorCode: "#D3AF37",
//     percentageFrom: 90,
//     percentageTo: 100,
//   },
// ];

// /**
//  * Find the master row a given percentage falls into.
//  * Returns null if nothing matches (gap in the master, or bad input).
//  */
// export function getCertificateTier(
//   percentage: number | string,
//   master: CertificateMasterRow[] = DEFAULT_CERTIFICATE_MASTER
// ): CertificateMasterRow | null {
//   const pct = Number(percentage);
//   if (Number.isNaN(pct)) return null;

//   return (
//     master.find((row) => pct >= Number(row.percentageFrom) && pct <= Number(row.percentageTo)) ??
//     null
//   );
// }

// /**
//  * Validate a master list before saving: required fields, valid ranges,
//  * valid hex colors, and no overlapping percentage bands.
//  * Returns an array of human-readable error strings (empty = valid).
//  */
// export function validateCertificateMaster(master: CertificateMasterRow[]): string[] {
//   const errors: string[] = [];
//   const sorted = [...master].sort((a, b) => Number(a.percentageFrom) - Number(b.percentageFrom));

//   sorted.forEach((row, i) => {
//     const label = row.certificateName || `Row ${i + 1}`;

//     if (
//       row.percentageFrom === undefined ||
//       row.percentageTo === undefined ||
//       row.percentageFrom === null ||
//       row.percentageTo === null ||
//       !row.certificateName ||
//       !row.designation ||
//       !row.colorCode
//     ) {
//       errors.push(`"${label}": all fields (name, designation, color, from, to) are required.`);
//     }
//     if (Number(row.percentageFrom) > Number(row.percentageTo)) {
//       errors.push(`"${label}": "From" must be less than or equal to "To".`);
//     }
//     if (Number(row.percentageFrom) < 0 || Number(row.percentageTo) > 100) {
//       errors.push(`"${label}": percentage must be between 0 and 100.`);
//     }
//     if (row.colorCode && !/^#([0-9A-Fa-f]{3}){1,2}$/.test(row.colorCode)) {
//       errors.push(`"${label}": color code "${row.colorCode}" is not a valid hex color.`);
//     }
//     if (i > 0) {
//       const prev = sorted[i - 1];
//       if (Number(row.percentageFrom) <= Number(prev.percentageTo)) {
//         errors.push(
//           `Overlap: "${prev.certificateName}" (${prev.percentageFrom}-${prev.percentageTo}) and "${row.certificateName}" (${row.percentageFrom}-${row.percentageTo}) overlap.`
//         );
//       }
//     }
//   });

//   return errors;
// }

// /** Darken/lighten a hex color by a percent amount. Used to derive gradients from one colorCode. */
// export function shadeColor(hex: string, percent: number): string {
//   const clean = hex.replace("#", "");
//   const num = parseInt(clean, 16);
//   let r = (num >> 16) + percent;
//   let g = ((num >> 8) & 0x00ff) + percent;
//   let b = (num & 0x0000ff) + percent;
//   r = Math.min(255, Math.max(0, r));
//   g = Math.min(255, Math.max(0, g));
//   b = Math.min(255, Math.max(0, b));
//   return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
// }