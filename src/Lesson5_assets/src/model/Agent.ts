// Imports and re-exports candid interface
import type { Identity } from "@dfinity/agent";
import type { Principal } from "@dfinity/principal";
import type { Maybe } from "./monad/Maybe";

import { createActor } from "../../../declarations/Lesson5";
import { MaybeMonad as M, nothing } from "./monad/Maybe";
import { ObservableMonad as O, encapsulated } from "./monad/Observable";

// LESSON5_CANISTER_ID is replaced by webpack based on node environment
export const canisterId: string = process.env.LESSON5_CANISTER_ID as string;

export const withIdentity =
  (identity: Identity) =>
  (cid: string = canisterId) =>
    createActor(cid, { agentOptions: { identity } });

export type MicroblogActor = ReturnType<typeof createActor>;

export const obIdentity = encapsulated(
  nothing as Maybe<Identity>,
  ({ notify }) => ({
    set: (i) => {
      notify(i);
    },
  })
);

export const obActorFor = O.fmapU(obIdentity, M.fmap(withIdentity));

export const obMainActor = O.fmapU(
  obActorFor,
  M.fmap((actorFor) => actorFor(canisterId))
);

export const obPrincipal = O.fmapU(
  obIdentity,
  M.fmap((id) => id.getPrincipal())
);

export const obOwner = encapsulated(nothing as Maybe<Principal>, (owner) => {
  const update = () =>
    M.fmapU(obMainActor.current(), async (actor) => {
      console.log(actor);
      owner.notify((await actor.get_owner())[0] ?? nothing);
    });
  return { update };
});
