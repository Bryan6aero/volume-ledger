// Rep counting and scoring logic. No DOM or camera code here, so it can be tested on its own.

// ---------- Reference data ----------
// min = weekly hard sets to hold muscle; goal = weekly target (upper body prioritised, legs maintained).
export const MUSCLES = [
  { id: "back",   name: "Back",          note: "lats, upper back", min: 6, goal: 14, pri: 1.5 },
  { id: "sdelt",  name: "Shoulders",     note: "side delts",       min: 6, goal: 14, pri: 1.5 },
  { id: "chest",  name: "Chest",         note: "",                 min: 6, goal: 12, pri: 1.5 },
  { id: "rdelt",  name: "Rear delts",    note: "",                 min: 3, goal: 8,  pri: 1 },
  { id: "bi",     name: "Biceps",        note: "",                 min: 4, goal: 10, pri: 1 },
  { id: "tri",    name: "Triceps",       note: "",                 min: 4, goal: 10, pri: 1 },
  { id: "abs",    name: "Abs",           note: "",                 min: 4, goal: 10, pri: 1.2 },
  { id: "quads",  name: "Quads",         note: "maintain",         min: 3, goal: 6,  pri: 0.6 },
  { id: "glutes", name: "Glutes & hams", note: "maintain",         min: 3, goal: 6,  pri: 0.6 },
];

// c   = credit per body part for one hard set (combo moves: only the limiting muscle gets full credit)
// sig = which joint movement the camera counts; view = where to stand relative to the phone
export const EXERCISES = [
  { id: "pullup",     name: "Pull-up",                    group: "Back",      load: 0,  sig: "elbow",    view: "front", c: { back: 1, bi: 0.5 } },
  { id: "chinup",     name: "Chin-up",                    group: "Back",      load: 0,  sig: "elbow",    view: "front", c: { back: 1, bi: 0.5 } },
  { id: "row",        name: "One-arm row",                group: "Back",      load: 35, sig: "elbow",    view: "side",  c: { back: 1, bi: 0.5, rdelt: 0.5 } },
  { id: "pullover",   name: "Dumbbell pullover",          group: "Back",      load: 20, sig: "shoulder", view: "side",  c: { back: 1 } },
  { id: "pullupLR",   name: "Pull-up with leg raise",     group: "Back",      load: 0,  sig: "elbow",    view: "front", c: { back: 1, bi: 0.5, abs: 0.5 } },
  { id: "pushup",     name: "Push-up",                    group: "Chest",     load: 0,  sig: "elbow",    view: "side",  c: { chest: 1, tri: 0.5 } },
  { id: "pushupFE",   name: "Feet-elevated push-up",      group: "Chest",     load: 0,  sig: "elbow",    view: "side",  c: { chest: 1, tri: 0.5 } },
  { id: "pushupDeep", name: "Deep push-up (hands on dumbbells)", group: "Chest", load: 0, sig: "elbow", view: "side",  c: { chest: 1, tri: 0.5 } },
  { id: "floorpress", name: "One-arm kettlebell floor press", group: "Chest", load: 35, sig: "elbow",    view: "side",  c: { chest: 1, tri: 0.5 } },
  { id: "sideraise",  name: "Side raise (shoulder fly)",  group: "Shoulders", load: 10, sig: "shoulder", view: "front", c: { sdelt: 1 } },
  { id: "leanraise",  name: "Leaning side raise",         group: "Shoulders", load: 10, sig: "shoulder", view: "front", c: { sdelt: 1 } },
  { id: "kbpress",    name: "Kettlebell press",           group: "Shoulders", load: 35, sig: "elbow",    view: "front", c: { sdelt: 0.5, tri: 0.5 } },
  { id: "pike",       name: "Pike push-up",               group: "Shoulders", load: 0,  sig: "elbow",    view: "side",  c: { sdelt: 0.5, tri: 0.5 } },
  { id: "revfly",     name: "Bent-over reverse fly",      group: "Shoulders", load: 5,  sig: "shoulder", view: "front", c: { rdelt: 1 } },
  { id: "curl",       name: "Curl",                       group: "Arms",      load: 20, sig: "elbow",    view: "side",  c: { bi: 1 } },
  { id: "hammer",     name: "Hammer curl",                group: "Arms",      load: 20, sig: "elbow",    view: "side",  c: { bi: 1 } },
  { id: "slowcurl",   name: "Slow-lowering curl",         group: "Arms",      load: 20, sig: "elbow",    view: "side",  c: { bi: 1 } },
  { id: "ohext",      name: "Overhead triceps extension", group: "Arms",      load: 20, sig: "elbow",    view: "side",  c: { tri: 1 } },
  { id: "diamond",    name: "Diamond push-up",            group: "Arms",      load: 0,  sig: "elbow",    view: "side",  c: { tri: 1, chest: 0.5 } },
  { id: "swimmer",    name: "Swimmer's press (curl and press)", group: "Combos", load: 20, sig: "wrist", view: "front", c: { bi: 1, sdelt: 0.25, tri: 0.25 } },
  { id: "swimmerSq",  name: "Curl, press and squat",      group: "Combos",    load: 20, sig: "knee",     view: "side",  c: { bi: 1, sdelt: 0.25, quads: 0.25 } },
  { id: "gobletPr",   name: "Goblet squat to press",      group: "Combos",    load: 35, sig: "knee",     view: "side",  c: { quads: 1, glutes: 0.5, sdelt: 0.25 } },
  { id: "hlr",        name: "Hanging leg raise",          group: "Abs",       load: 0,  sig: "hip",      view: "side",  c: { abs: 1 } },
  { id: "revcrunch",  name: "Reverse crunch",             group: "Abs",       load: 0,  sig: "hip",      view: "side",  c: { abs: 1 } },
  { id: "deadbug",    name: "Dead bug",                   group: "Abs",       load: 0,  sig: "hip",      view: "side",  c: { abs: 1 } },
  { id: "goblet",     name: "Goblet squat",               group: "Legs",      load: 35, sig: "knee",     view: "side",  c: { quads: 1, glutes: 0.5 } },
  { id: "split",      name: "Kettlebell split squat",     group: "Legs",      load: 35, sig: "knee",     view: "side",  c: { quads: 1, glutes: 0.5 } },
  { id: "swing",      name: "Kettlebell swing",           group: "Legs",      load: 35, sig: "hip",      view: "side",  c: { glutes: 1 } },
];

export const EFFORTS = [
  { v: "easy", label: "Easy",     sub: "6+ reps left", credit: 0 },
  { v: "mod",  label: "Moderate", sub: "4–5 left",     credit: 0.5 },
  { v: "hard", label: "Hard",     sub: "1–3 left",     credit: 1 },
  { v: "fail", label: "Failure",  sub: "none left",    credit: 1 },
];

// ---------- Joint signals from pose landmarks ----------
// Landmark indexes (MediaPipe pose): shoulder 11/12, elbow 13/14, wrist 15/16, hip 23/24, knee 25/26, ankle 27/28.
const J = { L: { sh: 11, el: 13, wr: 15, hip: 23, knee: 25, ank: 27 }, R: { sh: 12, el: 14, wr: 16, hip: 24, knee: 26, ank: 28 } };
// Smallest swing (degrees, or % of torso length for "wrist") that counts as half a rep.
export const SIGNALS = {
  elbow:    { joints: ["sh", "el", "wr"],     minAmp: 45 },
  shoulder: { joints: ["hip", "sh", "el"],    minAmp: 35 },
  knee:     { joints: ["hip", "knee", "ank"], minAmp: 40 },
  hip:      { joints: ["sh", "hip", "knee"],  minAmp: 30 },
  wrist:    { joints: ["sh", "hip", "wr"],    minAmp: 80 },
};
function angle(a, b, c) {
  const v1x = a.x - b.x, v1y = a.y - b.y, v2x = c.x - b.x, v2y = c.y - b.y;
  const d = Math.hypot(v1x, v1y) * Math.hypot(v2x, v2y);
  if (!d) return null;
  return Math.acos(Math.max(-1, Math.min(1, (v1x * v2x + v1y * v2y) / d))) * 180 / Math.PI;
}
// Returns the signal value for one body side, or null when those joints aren't clearly visible.
export function sideSignal(lm, sig, side, minVis = 0.5) {
  const spec = SIGNALS[sig], idx = J[side];
  const pts = spec.joints.map(j => lm[idx[j]]);
  if (pts.some(p => !p || (p.visibility ?? 1) < minVis)) return null;
  if (sig === "wrist") {
    const [sh, hip, wr] = pts, torso = Math.hypot(sh.x - hip.x, sh.y - hip.y);
    return torso ? (sh.y - wr.y) / torso * 100 : null;   // image y grows downward: positive = wrist above shoulder
  }
  return angle(pts[0], pts[1], pts[2]);
}

// ---------- Rep counter ----------
// Follows one signal and finds its turning points. A turning point is confirmed when the signal reverses,
// or when it holds still at an extreme. Two full swings (out and back) make one rep.
export function makeCounter(minAmp, { dwellMs = 600, alpha = 0.45 } = {}) {
  const R = minAmp * 0.4;
  let s = null, ext = null, extT = 0, dir = 0, pivot = null, halves = 0;
  const reps = [];   // { t: time the rep finished, dur: ms, amp }
  let repStart = null, lastAmp = 0, midT = 0;
  function confirm() {
    const amp = Math.abs(ext - pivot.v);
    if (amp >= minAmp) {
      halves++;
      if (halves % 2 === 0) { reps.push({ t: extT, mid: midT, dur: extT - repStart, amp: (amp + lastAmp) / 2 }); repStart = extT; }
      else { lastAmp = amp; midT = extT; }
      pivot = { v: ext, t: extT };
      return true;
    }
    // Too small to be half a rep: keep the old turning point unless this one stretches the range further.
    if (halves % 2 === 0) { pivot = { v: ext, t: extT }; repStart = extT; }
    return false;
  }
  return {
    reps,
    get count() { return reps.length; },
    get lastMoveT() { return reps.length || halves ? pivot.t : null; },
    push(raw, t) {
      s = s === null ? raw : s + alpha * (raw - s);
      if (ext === null) { ext = s; extT = t; pivot = { v: s, t }; repStart = t; return; }
      if (dir === 0) {
        if (Math.abs(s - pivot.v) >= R) { dir = s > pivot.v ? 1 : -1; ext = s; extT = t; }
        else if (halves === 0) { /* drifting at rest: let the start point follow slowly */ pivot.v += 0.02 * (s - pivot.v); pivot.t = t; repStart = t; }
        return;
      }
      if ((s - ext) * dir > 0) { ext = s; extT = t; return; }
      const reversed = (ext - s) * dir >= R, held = t - extT >= dwellMs && Math.abs(ext - pivot.v) >= minAmp;
      if (reversed || held) { confirm(); dir = reversed ? -dir : 0; ext = s; extT = t; }
    },
    // Call when the set ends so a final swing that never reversed still counts.
    flush() { if (dir !== 0 && ext !== null) { confirm(); dir = 0; } return reps.length; },
  };
}

// ---------- Effort estimate ----------
// Compares the last reps with the early ones. Reps slow down as a set nears failure.
// Returns null when there are too few reps to judge. Failure can't be seen, only reported.
export function estimateEffort(reps) {
  if (reps.length < 5) return null;
  // Time from the far point of one rep to the far point of the next: unaffected by pauses before or after the set.
  const durs = reps.slice(1).map((r, i) => r.mid - reps[i].mid);
  const early = durs.slice(0, 3).sort((a, b) => a - b)[1];
  const late = (durs[durs.length - 1] + durs[durs.length - 2]) / 2;
  const ratio = late / early;
  return { ratio, effort: ratio >= 1.4 ? "hard" : ratio >= 1.2 ? "mod" : "easy" };
}

// ---------- Scoring ----------
const E = Object.fromEntries(EXERCISES.map(e => [e.id, e]));
const EF = Object.fromEntries(EFFORTS.map(e => [e.v, e]));
export function setCredits(s) {
  const ex = E[s.ex], k = (EF[s.rir] || EF.easy).credit, out = {};
  if (!ex) return out;
  for (const m in ex.c) out[m] = ex.c[m] * k;
  return out;
}
export function totals(sets) {
  const t = Object.fromEntries(MUSCLES.map(m => [m.id, 0]));
  for (const s of sets) { const c = setCredits(s); for (const m in c) t[m] += c[m]; }
  return t;
}
