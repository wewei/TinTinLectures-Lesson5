import { Principal } from "@dfinity/principal";
import { Message } from "../../../declarations/Lesson5/Lesson5.did";
import { canisterId, obActorFor, obMainActor } from "./Agent";
import { MessageList } from "./Message";
import { cached, callWith } from "./monad/funcs";
import { fromMaybe, Maybe, MaybeMonad as M, nothing } from "./monad/Maybe";
import { all, encapsulated, ObservableMonad as O } from "./monad/Observable";

export const obFollowees = encapsulated<string[]>([])((mutFollowees) => {
  const update = () =>
    M.fmapU(obMainActor.current(), async (actor) => {
      const followees = await actor.follows();
      mutFollowees.notify(followees.map((p) => p.toString()));
    });

  const follow = (cId: string) => {
    M.fmapU(obMainActor.current(), async (actor) => {
      console.log(cId);
      await actor.follow(Principal.from(cId));
      update();
    });
  };
  update();

  return { update, follow };
});

export const postsFor = cached((cId: string) =>
  encapsulated<MessageList>({ messages: [], isRefreshing: false })(
    (mutPosts) => {
      const update = async () => {
        console.log("update", cId);
        const { messages, isRefreshing } = mutPosts.current();
        const actor = O.fmapU(obActorFor, M.fmap(callWith(cId))).current();
        console.log(actor);
        if (!isRefreshing && actor !== nothing) {
          mutPosts.notify({ messages, isRefreshing: true });
          const timestamp = messages[0]?.time ?? BigInt(0);
          const newMessages = await actor.posts(timestamp);
          newMessages.sort((a, b) =>
            a.time > b.time ? -1 : a.time < b.time ? 1 : 0
          );
          mutPosts.notify({
            messages: [...newMessages, ...messages],
            isRefreshing: false,
          });
        }
      };
      update();
      return { update };
    }
  )
);

export const obTimeline = O.chain(obFollowees)
  .fmap(
    M.fmap((followees) => {
      console.log(followees);
      return [canisterId, ...followees].map(postsFor);
    })
  )
  .bind<Maybe<MessageList[]>>((ps) => {
    console.log(ps);
    return ps === nothing ? O.pure(nothing) : all(ps);
  })
  .fmap<Maybe<MessageList>>(
    M.fmap((ps) => {
      console.log(ps);
      return {
        messages: ([] as Message[])
          .concat(...ps.map((p) => p.messages))
          .sort((a, b) => (a.time > b.time ? -1 : a.time < b.time ? 1 : 0)),
        isRefreshing: ps.some((p) => p.isRefreshing),
      };
    })
  )
  .fmap<MessageList>(
    fromMaybe<MessageList>({ messages: [], isRefreshing: false })
  )
  .value();
