import assert from "node:assert/strict";
import { test } from "node:test";
import { TypeSafeClient } from "@typesafe-ai/sdk";
import { buildQuestion, decideMove, fallbackMove } from "../src/decide.mjs";

const state = {
  key: "5:1:0",
  battle: { wave: 5, turn: 1, double: false },
  my_pokemon: { name: "Charmander", level: 12, types: ["FIRE"], hp_percent: 80, status: "NONE", ability: "Blaze" },
  enemies: [{ name: "Oddish", level: 11, types: ["GRASS", "POISON"], hp_percent: 100, status: "NONE" }],
  moves: [
    { slot: 0, usable: true, name: "Scratch", type: "NORMAL", category: "PHYSICAL", power: 40, accuracy: 100, priority: 0, pp_left: 35, effect: "", stab: false, effectiveness_vs: { Oddish: 1 } },
    { slot: 1, usable: true, name: "Growl", type: "NORMAL", category: "STATUS", power: -1, accuracy: 100, priority: 0, pp_left: 40, effect: "", stab: false, effectiveness_vs: { Oddish: 1 } },
    { slot: 3, usable: true, name: "Ember", type: "FIRE", category: "SPECIAL", power: 40, accuracy: 100, priority: 0, pp_left: 25, effect: "", stab: true, effectiveness_vs: { Oddish: 2 } },
  ],
};

function fakeClient(respond) {
  const requests = [];
  const client = new TypeSafeClient({
    apiKey: "test",
    retry: { maxRetries: 0 },
    fetch: async (_url, init) => {
      requests.push(JSON.parse(init.body));
      return respond();
    },
  });
  return { client, requests };
}

test("question has one label per usable move slot", () => {
  const q = buildQuestion(state);
  assert.equal(q.type, "choice");
  assert.deepEqual(Object.keys(q.criteria), ["move_0", "move_1", "move_3"]);
});

test("fallback prefers the super-effective STAB move", () => {
  assert.equal(fallbackMove(state).name, "Ember");
});

test("uses Jev's choice and sends the battle state", async () => {
  const { client, requests } = fakeClient(
    () =>
      new Response(
        JSON.stringify({
          model: "jev-latest",
          usage: { input_tokens: 1, output_tokens: 1 },
          answers: {
            move: { type: "choice", choice: "move_3", confidence: 0.9, probabilities: { move_0: 0.05, move_1: 0.05, move_3: 0.9 } },
          },
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
  );
  const decision = await decideMove(client, state);
  assert.equal(decision.source, "jev");
  assert.equal(decision.slot, 3);
  assert.equal(requests[0].state.enemies[0].name, "Oddish");
  assert.equal(requests[0].state.key, undefined);
  assert.equal(requests[0].state.moves[0].usable, undefined);
});

test("falls back when the API fails", async () => {
  const { client } = fakeClient(() => new Response("nope", { status: 401 }));
  const decision = await decideMove(client, state);
  assert.equal(decision.source, "fallback");
  assert.equal(decision.slot, 3);
});
