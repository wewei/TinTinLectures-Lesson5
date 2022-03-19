import { Principal } from "@dfinity/principal";
import { obActorFor, obPrincipal } from "./Agent";
import { cached, callWith } from "./monad/funcs";
import { Maybe, MaybeMonad as M, nothing } from "./monad/Maybe";
import {
  observable,
  Observable,
  ObservableMonad as O,
} from "./monad/Observable";
import { signal } from "./monad/Signal";

export const nameFor = cached((canisterId: string) =>
  O.chain(obActorFor)
    .fmap(M.fmap(callWith(canisterId)))
    .bind((actor) =>
      observable<Maybe<string>>(
        nothing,
        signal((notify) => {
          if (actor !== nothing) {
            actor.get_name().then(notify);
          }
          return () => {};
        })
      )
    )
    .value()
);

//  O.bindU(
//   obActorFor,
//   (actorFor): Observable<Maybe<string>> =>
//     observable<Maybe<string>>(
//       nothing as Maybe<string>,
//       signal(() => {
//         if (oser)
//       })
//     )
// );
