"use client";

import { useState } from "react";

// The class schedule builder for the College Agent's questionnaire (lib/collegeIntake.ts,
// field type "classes"). Ported from thecollegeagent.ai's own onboarding, which David preferred
// to a free-text box (Nov 10 2026): "It was much more detailed."
//
// One class at a time: its name, its course number, and when it meets. A class can meet in more
// than one block, because lecture, lab and discussion rarely share a slot (lecture Mon/Wed at 10,
// a Friday lab at 1:30), so each block carries its own days and its own start and end.
//
// STORED AS PLAIN LINES, one per class, the same way the "people" field stores "Mia (8)":
//
//   Marketing 301 (MKT 301): Mon / Wed 10:00 AM - 10:50 AM and Fri 1:30 PM - 3:20 PM
//
// That line is what USER.md prints, what the agent reads to build the student's week, and what
// the intake email shows, so nothing downstream needed to change. Classes are added and removed,
// not edited in place, as on the college site: removing one and adding it again is the edit.
//
// Shared by both questionnaires. Each passes its own colours, so it sits in either one's look.

export interface ClassListColors {
  accent: string;
  surface: string;
  border: string;
  text: string;
  muted: string;
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

type Block = { days: string[]; start: string; end: string };
const EMPTY_BLOCK: Block = { days: [], start: "", end: "" };

/** "13:05" -> "1:05 PM". Class times are irregular (10:00-10:50, 9:05 starts), so the native
 *  time input is used with no fixed steps, and the stored string stays human. */
function fmtTime(value: string): string {
  if (!value) return "";
  const [h24, m] = value.split(":").map(Number);
  if (Number.isNaN(h24) || Number.isNaN(m)) return "";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${h24 < 12 ? "AM" : "PM"}`;
}

function blockText(b: Block): string {
  const start = fmtTime(b.start);
  const end = fmtTime(b.end);
  const time = start && end ? `${start} - ${end}` : start || end;
  return [b.days.join(" / "), time].filter(Boolean).join(" ");
}

/** One class as the single line it is stored as. */
export function classLine(name: string, code: string, blocks: Block[]): string {
  const title = [name.trim(), code.trim() ? `(${code.trim()})` : ""].filter(Boolean).join(" ");
  const when = blocks.map(blockText).filter(Boolean).join(" and ");
  return when ? `${title}: ${when}` : title;
}

export default function ClassListInput({
  value,
  onChange,
  colors,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  colors: ClassListColors;
}) {
  const { accent, surface, border, text, muted } = colors;
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [blocks, setBlocks] = useState<Block[]>([{ ...EMPTY_BLOCK }]);

  const canAdd = name.trim() !== "";
  const classes = value.filter((c) => c.trim());

  const add = () => {
    if (!canAdd) return;
    onChange([...classes, classLine(name, code, blocks)]);
    setName("");
    setCode("");
    setBlocks([{ ...EMPTY_BLOCK }]);
  };
  const remove = (i: number) => onChange(classes.filter((_, n) => n !== i));
  const patch = (i: number, p: Partial<Block>) => setBlocks(blocks.map((b, n) => (n === i ? { ...b, ...p } : b)));
  const toggleDay = (i: number, day: string) => {
    const cur = blocks[i].days;
    const next = cur.includes(day) ? cur.filter((d) => d !== day) : [...cur, day];
    // Week order, whatever order they were tapped in.
    patch(i, { days: DAYS.filter((d) => next.includes(d)) });
  };

  const input: React.CSSProperties = {
    width: "100%",
    boxSizing: "border-box",
    fontFamily: "inherit",
    fontSize: 15,
    padding: "10px 12px",
    border: `1px solid ${border}`,
    borderRadius: 8,
    background: "#fff",
    color: text,
    outline: "none",
  };
  const label: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 5, fontSize: 13, fontWeight: 600, color: muted };
  const onEnter = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      add();
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {classes.length > 0 && (
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 6 }}>
          {classes.map((c, i) => {
            const [title, ...rest] = c.split(": ");
            return (
              <li key={`${c}-${i}`} style={{ display: "flex", alignItems: "center", gap: 10, background: surface, border: `1px solid ${border}`, borderRadius: 10, padding: "10px 12px" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: text }}>{title}</div>
                  {rest.length > 0 && <div style={{ fontSize: 13, color: muted, marginTop: 2 }}>{rest.join(": ")}</div>}
                </div>
                <button type="button" onClick={() => remove(i)} aria-label={`Remove ${title}`} style={{ border: "none", background: "none", color: muted, cursor: "pointer", fontSize: 18, lineHeight: 1, padding: "0 4px" }}>
                  ×
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <div style={{ border: `1.5px dashed ${border}`, borderRadius: 12, padding: 14, display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 180px), 1fr))", gap: 10 }}>
          <label style={label}>
            Class name
            <input value={name} onChange={(e) => setName(e.target.value)} onKeyDown={onEnter} placeholder="Marketing 301" style={input} />
          </label>
          <label style={label}>
            Course number
            <input value={code} onChange={(e) => setCode(e.target.value)} onKeyDown={onEnter} placeholder="MKT 301" style={input} />
          </label>
        </div>

        <div style={{ ...label, gap: 8 }}>
          When it meets
          {blocks.map((b, bi) => (
            <div key={bi} style={{ position: "relative", border: `1px solid ${border}`, borderRadius: 10, padding: "12px 12px 12px", display: "flex", flexDirection: "column", gap: 10, background: "#fff" }}>
              {blocks.length > 1 && (
                <button type="button" onClick={() => setBlocks(blocks.filter((_, n) => n !== bi))} aria-label="Remove this meeting time" style={{ position: "absolute", top: 6, right: 8, border: "none", background: "none", color: muted, cursor: "pointer", fontSize: 16, lineHeight: 1 }}>
                  ×
                </button>
              )}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, paddingRight: blocks.length > 1 ? 22 : 0 }}>
                {DAYS.map((day) => {
                  const on = b.days.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(bi, day)}
                      aria-pressed={on}
                      style={{ fontFamily: "inherit", fontSize: 13, fontWeight: 600, padding: "6px 12px", borderRadius: 999, cursor: "pointer", border: `1.5px solid ${on ? accent : border}`, background: on ? accent : "#fff", color: on ? "#fff" : text }}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <label style={{ ...label, fontWeight: 500 }}>
                  Starts
                  <input type="time" value={b.start} onChange={(e) => patch(bi, { start: e.target.value })} style={input} />
                </label>
                <label style={{ ...label, fontWeight: 500 }}>
                  Ends
                  <input type="time" value={b.end} onChange={(e) => patch(bi, { end: e.target.value })} style={input} />
                </label>
              </div>
            </div>
          ))}
          <button type="button" onClick={() => setBlocks([...blocks, { ...EMPTY_BLOCK }])} style={{ alignSelf: "flex-start", border: "none", background: "none", color: accent, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 700, padding: "2px 0" }}>
            + Add another day and time (like a Friday lab)
          </button>
        </div>

        <button
          type="button"
          onClick={add}
          disabled={!canAdd}
          style={{ border: "none", borderRadius: 8, padding: "11px 14px", fontFamily: "inherit", fontSize: 14, fontWeight: 700, cursor: canAdd ? "pointer" : "not-allowed", background: canAdd ? accent : surface, color: canAdd ? "#fff" : muted }}
        >
          {classes.length ? "+ Add this class" : "+ Add class"}
        </button>
      </div>
    </div>
  );
}
