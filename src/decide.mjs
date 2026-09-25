import { choice } from "@typesafe-ai/sdk";

const INSTRUCTIONS = {
  task: "You are playing a turn of a Pokémon battle in PokeRogue. Pick the move for `my_pokemon` that best helps win this battle.",
  consider: [
    "Expected damage: `power`, `accuracy`, `stab` (same-type bonus, x1.5) and `effectiveness_vs` for each enemy (0 = immune, 0.5 = resisted, 2 or 4 = super effective).",
    "Finishing an enemy with low `hp_percent` before it can act.",
    "Status or stat-boosting moves only when they clearly pay off, e.g. `my_pokemon` is healthy and the enemy cannot threaten it quickly.",
    "Never pick a move the enemy is immune to when a damaging alternative exists.",
  ],
};

/** Build the Jev question: one Choice label per usable move slot. */
export function buildQuestion(state) {
  const criteria = Object.fromEntries(
    state.moves.map(m => [
      `move_${m.slot}`,
      `Use ${m.name} (${m.type}, ${m.category}, power ${m.power || "-"}, accuracy ${m.accuracy < 0 ? "never misses" : m.accuracy})`,
    ]),
  );
  return choice(INSTRUCTIONS, criteria);
}

/** Pick by expected damage when Jev is unavailable. */
export function fallbackMove(state) {
  const damage = m => {
    if (m.category === "STATUS" || !m.power) {
      return 0;
    }
    const eff = Math.max(0, ...Object.values(m.effectiveness_vs));
    const acc = m.accuracy < 0 ? 1 : m.accuracy / 100;
    return m.power * acc * eff * (m.stab ? 1.5 : 1);
  };
  return state.moves.reduce((best, m) => (damage(m) > damage(best) ? m : best), state.moves[0]);
}

/**
 * Ask Jev which move to use. Returns the chosen move slot plus the
 * probabilities, or falls back to the damage heuristic on any API failure.
 */
export async function decideMove(client, state) {
  if (state.moves.length === 1) {
    return { slot: state.moves[0].slot, source: "only-move" };
  }
  const { moves, key: _key, ...context } = state;
  try {
    const { answers } = await client.systemOne({
      state: { ...context, moves: moves.map(({ usable: _u, ...m }) => m) },
      questions: { move: buildQuestion(state) },
    });
    const { choice: label, confidence, probabilities } = answers.move;
    return { slot: Number(label.slice("move_".length)), source: "jev", confidence, probabilities };
  } catch (error) {
    return { slot: fallbackMove(state).slot, source: "fallback", error: error.message };
  }
}
