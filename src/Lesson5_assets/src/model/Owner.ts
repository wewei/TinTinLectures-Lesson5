import type { Observable } from "./monad/Observable";
import type { Maybe } from "./monad/Maybe";
import type { Principal } from "@dfinity/principal";

import { obMainActor, obPrincipal } from "./Agent";
import { nothing, MaybeMonad as M } from "./monad/Maybe";
import { encapsulated, ObservableMonad as O } from "./monad/Observable";

export type OwnerStatus = "Unknown" | "Unowned" | "OwnedByOthers" | "IsOwner";

export const obOwner = encapsulated(
  nothing as Maybe<Principal | null>,
  (owner) => ({
    update: () =>
      M.fmapU(obMainActor.current(), async (actor) => {
        owner.notify((await actor.get_owner())[0] ?? nothing);
      }),
  })
);

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
