// Imports and re-exports candid interface
import type { Identity } from "@dfinity/agent";

import { createActor } from "../../../declarations/Lesson5";
import { Maybe, MaybeMonad as M, nothing } from "../model/monad/Maybe";
import { simpleState, WatchableMonad as W } from "./Watchable";

// LESSON5_CANISTER_ID is replaced by webpack based on node environment
export const CANISTER_ID = process.env.LESSON5_CANISTER_ID as string;
export const sttCidMain = simpleState(CANISTER_ID);
export const sttIdentity = simpleState(nothing as Maybe<Identity>);
export const watActorFor = W.fmapU(
  sttIdentity,
  M.fmap(
    (identity) => (canisterId: string) =>
      createActor(canisterId, { agentOptions: { identity } })
  )
);

export const watActorMain = W.bindU(sttCidMain, (cidMain) =>
  W.fmapU(
    watActorFor,
    M.fmap((actorFor) => actorFor(cidMain))
  )
);

export const watPrincipal = W.fmapU(
  sttIdentity,
  M.fmap((identity) => identity.getPrincipal())
);

export type MicroblogActor = ReturnType<typeof createActor>;
