import { TypeSafeClient } from "@typesafe-ai/sdk";
import { chromium } from "playwright";
import { decideMove } from "./decide.mjs";
import { readBattleState, useMove } from "./game.mjs";

const GAME_URL = process.env.POKEROGUE_URL ?? "http://localhost:8000";
const SRC_ROOT = process.env.POKEROGUE_SRC_ROOT ?? "/src";
const POLL_MS = 500;

const client = new TypeSafeClient();

// A persistent profile keeps the local save data between bot runs.
const context = await chromium.launchPersistentContext(".browser-profile", {
  headless: false,
  viewport: null,
});
const page = context.pages()[0] ?? (await context.newPage());
await page.goto(GAME_URL);
console.log(`PokeRogue 열림: ${GAME_URL}`);
console.log("게임을 시작하세요. 전투에서 기술 선택 차례가 오면 봇이 대신 고릅니다. (종료: Ctrl+C)");

let lastKey = null;
while (!page.isClosed()) {
  try {
    const state = await page.evaluate(readBattleState, { srcRoot: SRC_ROOT });
    if (state && state.key !== lastKey && state.moves.length > 0) {
      lastKey = state.key;
      const decision = await decideMove(client, state);
      const move = state.moves.find(m => m.slot === decision.slot);
      const enemies = state.enemies.map(e => `${e.name}(${e.hp_percent}%)`).join(", ");
      console.log(
        `[웨이브 ${state.battle.wave} 턴 ${state.battle.turn}] ${state.my_pokemon.name}(${state.my_pokemon.hp_percent}%) vs ${enemies}`,
      );
      if (decision.source === "jev") {
        const probs = Object.entries(decision.probabilities)
          .map(([label, p]) => `${state.moves.find(m => `move_${m.slot}` === label)?.name}:${(p * 100).toFixed(0)}%`)
          .join(" ");
        console.log(`  Jev 선택 → ${move.name} (확신도 ${(decision.confidence * 100).toFixed(0)}%) [${probs}]`);
      } else if (decision.source === "fallback") {
        console.log(`  Jev 호출 실패(${decision.error}) → 대체 규칙으로 ${move.name}`);
      } else {
        console.log(`  쓸 수 있는 기술이 하나뿐 → ${move.name}`);
      }
      const ok = await page.evaluate(useMove, { srcRoot: SRC_ROOT, slot: decision.slot });
      if (!ok) {
        console.log("  게임이 이 선택을 거부했습니다. 이번 턴은 직접 골라 주세요.");
      }
    }
  } catch (error) {
    if (page.isClosed()) {
      break;
    }
    // Page reloads and scene transitions briefly break module access; retry next poll.
    if (!/Execution context was destroyed|navigation/i.test(error.message)) {
      console.error("오류:", error.message);
    }
  }
  await page.waitForTimeout(POLL_MS).catch(() => {});
}
await context.close();
