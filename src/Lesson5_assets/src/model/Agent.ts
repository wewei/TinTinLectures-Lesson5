// Imports and re-exports candid interface
import type { Identity } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import { fromMaybe, Maybe } from "./monad/Maybe";

import { createActor } from "../../../declarations/Lesson5";
import { MaybeMonad as M, nothing } from "./monad/Maybe";
import {
  ObservableMonad as O,
  encapsulated,
  mutable,
  Observable,
} from "./monad/Observable";

// LESSON5_CANISTER_ID is replaced by webpack based on node environment
export const canisterId: string = process.env.LESSON5_CANISTER_ID as string;

export const withIdentity =
  (identity: Identity) =>
  (cid: string = canisterId) =>
    createActor(cid, { agentOptions: { identity } });

export type MicroblogActor = ReturnType<typeof createActor>;

export const obIdentity = encapsulated(
  nothing as Maybe<Identity>,
  ({ notify }) => ({ set: notify })
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

export const obOwner = encapsulated(
  nothing as Maybe<Principal | null>,
  (owner) => ({
    update: () =>
      M.fmapU(obMainActor.current(), async (actor) => {
        owner.notify((await actor.get_owner())[0] ?? nothing);
      }),
  })
);

export type OwnerStatus = "Unknown" | "Unowned" | "OwnedByOthers" | "IsOwner";
export const obOwnerStatus = O.bindU(
  obOwner,
  (o): Observable<OwnerStatus> =>
    o === nothing
      ? O.pure("Unknown")
      : o === null
      ? O.pure("Unowned")
      : O.fmapU(obPrincipal, (p) =>
          p === nothing
            ? "Unknown"
            : p.toString() === o.toString()
            ? "IsOwner"
            : "OwnedByOthers"
        )
);
