// src/lib/exams/blueprint.ts
// Pure logic, NO server imports. Used by the admin page, the API validation
// and the student paper generator, so all three always agree.

export const QUESTION_TYPES = ["Conceptual", "Prediction", "Debugging", "ProblemSolving"] as const;
export type QType = (typeof QUESTION_TYPES)[number];

/** "Each student's paper has `marks` marks worth of `questionType` questions." */
export interface BlueprintRule {
  questionType: QType;
  marks: number;
}

export interface PoolQuestion {
  questionType?: string | null;
  points: number;
}

type Rnd = (max: number) => number; // returns integer in [0, max)
const defaultRnd: Rnd = (n) => Math.floor(Math.random() * n);

export function shuffle<T>(arr: T[], rnd: Rnd = defaultRnd): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = rnd(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Can some subset of these question marks add up to EXACTLY `target`? (subset-sum) */
export function canMakeMarks(points: number[], target: number): boolean {
  if (target <= 0) return true;
  const reach = new Uint8Array(target + 1);
  reach[0] = 1;
  for (const p of points) {
    if (!Number.isInteger(p) || p < 1 || p > target) continue;
    for (let s = target; s >= p; s--) if (reach[s - p]) reach[s] = 1;
  }
  return reach[target] === 1;
}

/**
 * Randomly pick questions whose marks add up to EXACTLY `target`.
 * Works for equal marks (1,1,1...) and mixed marks (1,2,3...).
 * Returns null if it is impossible.
 */
export function pickByMarks<T extends { points: number }>(
  items: T[],
  target: number,
  rnd: Rnd = defaultRnd
): T[] | null {
  if (target <= 0) return [];
  const a = shuffle(items, rnd).filter((i) => i.points >= 1 && i.points <= target);
  const n = a.length;

  // reach[i][s] = true if sum s can be made using only the first i shuffled items
  const reach: Uint8Array[] = [new Uint8Array(target + 1)];
  reach[0][0] = 1;
  for (let i = 1; i <= n; i++) {
    const prev = reach[i - 1];
    const cur = Uint8Array.from(prev);
    const p = a[i - 1].points;
    for (let s = p; s <= target; s++) if (prev[s - p]) cur[s] = 1;
    reach.push(cur);
  }
  if (!reach[n][target]) return null;

  // walk back and collect the items that were used
  const out: T[] = [];
  let s = target;
  for (let i = n; i > 0 && s > 0; i--) {
    if (reach[i - 1][s]) continue; // not needed
    out.push(a[i - 1]);
    s -= a[i - 1].points;
  }
  return out;
}

export const blueprintTotal = (rules: BlueprintRule[]) => rules.reduce((s, r) => s + r.marks, 0);

export interface TypeSummary {
  questionType: QType;
  target: number;        // marks per student for this type (0 = not used)
  poolCount: number;     // questions of this type in the pool
  poolMarks: number;     // total marks of those questions
  shortBy: number;       // marks missing in the pool
  feasible: boolean;     // exact target can be built
  uniform: number | null;   // marks of each question if they are all equal
  perStudent: number | null; // questions per student when marks are equal
}

export function summarizeBlueprint(questions: PoolQuestion[], rules: BlueprintRule[]): TypeSummary[] {
  return QUESTION_TYPES.map((t) => {
    const target = rules.find((r) => r.questionType === t)?.marks ?? 0;
    const pts = questions.filter((q) => q.questionType === t).map((q) => q.points);
    const poolMarks = pts.reduce((s, p) => s + (p > 0 ? p : 0), 0);
    const shortBy = Math.max(0, target - poolMarks);
    const feasible = target === 0 || (shortBy === 0 && canMakeMarks(pts, target));
    const uniform = pts.length > 0 && pts.every((p) => p === pts[0]) ? pts[0] : null;
    const perStudent = uniform && target % uniform === 0 ? target / uniform : null;
    return { questionType: t, target, poolCount: pts.length, poolMarks, shortBy, feasible, uniform, perStudent };
  });
}

/** errors block saving; warnings are only shown. */
export function checkBlueprint(
  questions: PoolQuestion[],
  rules: BlueprintRule[],
  examTotal?: number
): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (rules.length === 0) {
    errors.push("Set marks for at least one question type");
    return { errors, warnings };
  }

  const types = rules.map((r) => r.questionType);
  if (new Set(types).size !== types.length) errors.push("Each question type can appear only once");
  if (rules.some((r) => !Number.isInteger(r.marks) || r.marks < 1)) errors.push("Blueprint marks must be whole numbers of 1 or more");

  for (const s of summarizeBlueprint(questions, rules)) {
    if (s.target === 0) {
      if (s.poolCount > 0) warnings.push(`${s.poolCount} ${s.questionType} question(s) will never be shown (type not used in the blueprint)`);
      continue;
    }
    if (s.shortBy > 0) {
      errors.push(`${s.questionType}: students need ${s.target} marks but the pool has only ${s.poolMarks}. Add ${s.shortBy} more marks of questions`);
    } else if (!s.feasible) {
      errors.push(`${s.questionType}: cannot make exactly ${s.target} marks from the marks given to these questions. Add questions with other marks values (e.g. 1 mark)`);
    }
  }

  const total = blueprintTotal(rules);
  if (examTotal !== undefined && total !== examTotal) {
    errors.push(`Blueprint marks (${total}) must equal the exam total marks (${examTotal})`);
  }

  return { errors, warnings };
}