/**
 * Deterministic consistency rules for pre-extracted skill edges.
 * Machine-checks rules 1–3 from skill-composition/SKILL.md.
 * Rule 4 (checker edits nothing) is agent-enforced, not in this engine.
 * Does NOT parse SKILL.md prose — extraction is agent-judged.
 */

export function checkCompositionRules({ subject_name, invokes, forbids, requires, catalog }) {
  if (!Array.isArray(catalog) || catalog.length === 0) {
    return { verdict: "blocked", missing: ["catalog"] };
  }
  if (typeof subject_name !== "string" || !subject_name) {
    return { verdict: "blocked", missing: ["subject_name"] };
  }

  const inv = Array.isArray(invokes) ? invokes : [];
  const forb = Array.isArray(forbids) ? forbids : [];
  const req = Array.isArray(requires) ? requires : [];

  const catalogSet = new Set(catalog);
  const findings = [];
  let findingId = 0;

  const allEdges = [
    ...inv.map((t) => ({ edge: "invokes", target: t })),
    ...forb.map((t) => ({ edge: "forbids", target: t })),
    ...req.map((t) => ({ edge: "requires", target: t })),
  ];

  for (const { edge, target } of allEdges) {
    if (!catalogSet.has(target)) {
      findingId++;
      findings.push({
        id: `F${findingId}`,
        rule: 1,
        edge,
        target,
        remedy: "Remove the edge or add a real INDEX-listed skill.",
      });
    }
  }

  const forbSet = new Set(forb);
  for (const target of inv) {
    if (forbSet.has(target)) {
      findingId++;
      findings.push({
        id: `F${findingId}`,
        rule: 2,
        edge: "invokes ∩ forbids",
        target,
        remedy: "A skill cannot both invoke and forbid the same target.",
      });
    }
  }

  if (inv.includes(subject_name)) {
    findingId++;
    findings.push({
      id: `F${findingId}`,
      rule: 3,
      edge: "invokes",
      target: subject_name,
      remedy: "A skill must not invoke itself.",
    });
  }

  if (findings.length > 0) {
    return { verdict: "composition_fail", invokes: inv, forbids: forb, requires: req, findings };
  }

  return { verdict: "composition_ok", invokes: inv, forbids: forb, requires: req };
}
