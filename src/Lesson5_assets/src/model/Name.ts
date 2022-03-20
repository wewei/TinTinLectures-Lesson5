import { canisterId, obActorFor } from "./Agent";
import { cached, callWith } from "./monad/funcs";
import { Maybe, MaybeMonad as M, nothing } from "./monad/Maybe";
import { encapsulated, ObservableMonad as O } from "./monad/Observable";

export const nameFor = cached((cId: string) =>
  encapsulated<Maybe<string>>(nothing)((mutName) => {
    const update = async () => {
      const actor = O.fmapU(obActorFor, M.fmap(callWith(cId))).current();
      if (actor !== nothing) {
        mutName.notify(await actor.get_name());
      }
    };
    update();

    const set = async (newName: string) => {
      const actor = O.fmapU(obActorFor, M.fmap(callWith(cId))).current();
      if (actor !== nothing) {
        await actor.set_name(newName);
        mutName.notify(newName);
      }
    };
    return { update, set };
  })
);

export const obMyName = nameFor(canisterId);
