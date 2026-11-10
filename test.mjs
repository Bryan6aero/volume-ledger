import { makeCounter, estimateEffort, sideSignal, totals } from "./core.js";
let fail = 0;
const ok = (name, cond, info = "") => { console.log((cond ? "PASS " : "FAIL ") + name + " " + info); if (!cond) fail++; };
// Simulate a joint angle at 15 fps: rest, then reps of given durations (s) between lo and hi, with noise, then rest.
function sim(durs, { lo = 40, hi = 160, noise = 3, rest = 2, hold = 0, startHi = true } = {}) {
  const out = []; let t = 0; const dt = 1000 / 15; let seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed / 2147483647 - 0.5) * 2 * noise; };
  const a = startHi ? hi : lo, b = startHi ? lo : hi;
  for (let i = 0; i < rest * 15; i++) { out.push([a + rnd(), t]); t += dt; }
  for (const d of durs) {
    const n = Math.round(d * 15);
    for (let i = 0; i < n; i++) { const p = (1 - Math.cos(2 * Math.PI * i / n)) / 2; out.push([a + (b - a) * p + rnd(), t]); t += dt; }
    for (let i = 0; i < hold * 15; i++) { out.push([a + rnd(), t]); t += dt; }
  }
  for (let i = 0; i < rest * 15; i++) { out.push([a + rnd(), t]); t += dt; }
  return out;
}
function run(samples, minAmp = 45) { const c = makeCounter(minAmp); for (const [v, t] of samples) c.push(v, t); c.flush(); return c; }

let c = run(sim(Array(12).fill(2)));
ok("12 steady curls", c.count === 12, "got " + c.count);
c = run(sim(Array(8).fill(1.2), { startHi: false }));
ok("8 fast reps starting low", c.count === 8, "got " + c.count);
c = run(sim(Array(10).fill(2), { hold: 1 }));
ok("10 reps with 1s pause between", c.count === 10, "got " + c.count);
c = run(sim(Array(6).fill(2), { lo: 100, hi: 120 }));
ok("small 20 degree wiggles ignored", c.count === 0, "got " + c.count);
c = run(sim([], { rest: 10, noise: 6 }));
ok("standing still counts nothing", c.count === 0, "got " + c.count);
c = run(sim(Array(5).fill(3), { noise: 8 }));
ok("5 slow reps with heavy noise", c.count === 5, "got " + c.count);
c = run(sim(Array(15).fill(1.5), { lo: 100, hi: 175 }), 40);
ok("15 squats, 75 degree range", c.count === 15, "got " + c.count);
// no trailing rest: last rep must be flushed
{ const s = sim(Array(4).fill(2), { rest: 0 }); const k = makeCounter(45); for (const [v, t] of s) k.push(v, t); const before = k.count; k.flush(); ok("flush counts final rep", k.count === 4, "before " + before + " after " + k.count); }

c = run(sim([2, 2, 2, 2, 2, 2, 2, 2]));
let e = estimateEffort(c.reps); ok("steady tempo reads easy", e && e.effort === "easy", JSON.stringify(e));
c = run(sim([2, 2, 2, 2, 2.2, 2.4, 2.6, 2.7]));
e = estimateEffort(c.reps); ok("30% slowdown reads moderate", e && e.effort === "mod", JSON.stringify(e));
c = run(sim([2, 2, 2, 2.1, 2.3, 2.6, 3.0, 3.6]));
e = estimateEffort(c.reps); ok("65% slowdown reads hard", e && e.effort === "hard", JSON.stringify(e));
ok("4 reps gives no estimate", estimateEffort(run(sim([2, 2, 2, 2])).reps) === null);
c = run(sim([2, 2, 2, 2, 2, 2, 2, 2], { hold: 1 }));
e = estimateEffort(c.reps); ok("steady with pauses reads easy", e && e.effort === "easy", JSON.stringify(e));

// signals
const lm = []; for (let i = 0; i < 33; i++) lm[i] = { x: 0, y: 0, visibility: 0.9 };
lm[11] = { x: 0.5, y: 0.3, visibility: 0.9 }; lm[13] = { x: 0.5, y: 0.5, visibility: 0.9 }; lm[15] = { x: 0.5, y: 0.7, visibility: 0.9 }; lm[23] = { x: 0.5, y: 0.7, visibility: 0.9 };
ok("straight arm = 180", Math.abs(sideSignal(lm, "elbow", "L") - 180) < 0.01);
lm[15] = { x: 0.7, y: 0.5, visibility: 0.9 };
ok("bent arm = 90", Math.abs(sideSignal(lm, "elbow", "L") - 90) < 0.01);
lm[15] = { x: 0.5, y: 0.1, visibility: 0.9 };
ok("wrist overhead is positive", sideSignal(lm, "wrist", "L") > 40, String(sideSignal(lm, "wrist", "L")));
lm[15].visibility = 0.2;
ok("hidden joint gives null", sideSignal(lm, "elbow", "L") === null);

const t = totals([{ ex: "pullup", rir: "hard" }, { ex: "pullup", rir: "mod" }, { ex: "swimmer", rir: "fail" }, { ex: "curl", rir: "easy" }]);
ok("totals", t.back === 1.5 && t.bi === 1.75 && t.sdelt === 0.25, JSON.stringify(t));
console.log(fail ? fail + " FAILED" : "ALL PASS"); process.exit(fail ? 1 : 0);
