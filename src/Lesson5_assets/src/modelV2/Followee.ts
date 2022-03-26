import { Set } from "immutable";
import { MaybeMonad as M } from "../model/monad/Maybe";
import { watActorMain } from "./Agent";
import { state, WatchableMonad as W } from "./Watchable";

export type FolloweeAction =
  | { type: "Set"; canisterIds: string[] }
  | { type: "Follow"; canisterId: string };

export const sttFollowee = state<Set<string>, FolloweeAction>({
  initial: Set(),
  transition: (act) => {
    switch (act.type) {
      case "Set":
        return () => Set(act.canisterIds);
      case "Follow": {
        return (set) => set.add(act.canisterId);
      }
    }
  },
  effect: (act) => () => {
    if (act.type === "Follow") {
      M.fmapU(watActorMain.watch(), async (actorMain) => {
        const followees = await actorMain.follows();
        sttFollowee.notify({
          type: "Set",
          canisterIds: followees.map((principal) => principal.toString()),
        });
      });
    }
  },
  equals: (s1) => (s2) => s1.equals(s2),
});
