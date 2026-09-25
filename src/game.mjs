// Runs inside the PokeRogue page (via Playwright's page.evaluate).
//
// PokeRogue does not expose its BattleScene on `window`, but in a local Vite dev
// server every source file is served as an ES module at its own URL. Importing
// that URL from the page returns the same module instance the game uses, so
// `globalScene` is the live scene. This only works against `pnpm start:dev`,
// not the minified production build on pokerogue.net.

/**
 * Read the current battle if the game is waiting for the player to pick a
 * command, or return `null` when it is not.
 */
export async function readBattleState({ srcRoot }) {
  const [{ globalScene }, { PokemonType }, { MoveCategory }, { StatusEffect }, { UiMode }] = await Promise.all([
    import(`${srcRoot}/globals/global-scene.ts`),
    import(`${srcRoot}/enums/pokemon-type.ts`),
    import(`${srcRoot}/enums/move-category.ts`),
    import(`${srcRoot}/enums/status-effect.ts`),
    import(`${srcRoot}/enums/ui-mode.ts`),
  ]);

  const scene = globalScene;
  const phase = scene?.phaseManager?.getCurrentPhase();
  if (!scene?.currentBattle || phase?.phaseName !== "CommandPhase") {
    return null;
  }
  if (scene.ui.mode !== UiMode.COMMAND && scene.ui.mode !== UiMode.FIGHT) {
    return null;
  }

  const fieldIndex = phase.fieldIndex ?? 0;
  const me = scene.getPlayerField()[fieldIndex];
  if (!me) {
    return null;
  }

  const typeNames = p => p.getTypes().map(t => PokemonType[t]);
  const hpPercent = p => Math.round(p.getHpRatio(true) * 100);
  const statusName = p => (p.status?.effect ? StatusEffect[p.status.effect] : "NONE");
  const enemies = scene.getEnemyField().filter(e => e.isActive(true));
  const myTypes = me.getTypes();

  const moves = me
    .getMoveset()
    .map((pm, slot) => {
      const move = pm.getMove();
      const [usable] = pm.isUsable(me, false, true);
      return {
        slot,
        usable,
        name: pm.getName(),
        type: PokemonType[move.type],
        category: MoveCategory[move.category],
        power: move.power,
        accuracy: move.accuracy,
        priority: move.priority,
        pp_left: pm.getMovePp() - pm.ppUsed,
        effect: move.effect ?? "",
        stab: myTypes.includes(move.type),
        effectiveness_vs: Object.fromEntries(
          enemies.map(e => [e.name, e.getAttackTypeEffectiveness(move.type, { source: me, move })]),
        ),
      };
    })
    .filter(m => m.usable);

  return {
    key: `${scene.currentBattle.waveIndex}:${scene.currentBattle.turn}:${fieldIndex}`,
    battle: {
      wave: scene.currentBattle.waveIndex,
      turn: scene.currentBattle.turn,
      double: !!scene.currentBattle.double,
    },
    my_pokemon: {
      name: me.name,
      level: me.level,
      types: typeNames(me),
      hp_percent: hpPercent(me),
      status: statusName(me),
      ability: me.getAbility().name,
    },
    enemies: enemies.map(e => ({
      name: e.name,
      level: e.level,
      types: typeNames(e),
      hp_percent: hpPercent(e),
      status: statusName(e),
    })),
    moves,
  };
}

/** Submit a FIGHT command for the given move slot, as the fight menu does. */
export async function useMove({ srcRoot, slot }) {
  const [{ globalScene }, { Command }, { MoveUseMode }] = await Promise.all([
    import(`${srcRoot}/globals/global-scene.ts`),
    import(`${srcRoot}/enums/command.ts`),
    import(`${srcRoot}/enums/move-use-mode.ts`),
  ]);
  const phase = globalScene.phaseManager.getCurrentPhase();
  if (phase?.phaseName !== "CommandPhase") {
    return false;
  }
  return phase.handleCommand(Command.FIGHT, slot, MoveUseMode.NORMAL);
}
