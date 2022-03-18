import { Message } from "../../../declarations/Lesson5/Lesson5.did";
import { obActorFor, obMainActor, obPrincipal } from "./Agent";
import { just, Maybe, nothing } from "./monad/Maybe";
import { encapsulated } from "./monad/Observable";

export type MessageList = {
  messages: Message[];
  isRefreshing: boolean;
};

export const obMyPosts = encapsulated(
  {
    messages: [],
    isRefreshing: false,
  } as MessageList,
  (mutMyPosts) => {
    const update = async () => {
      const { messages, isRefreshing } = mutMyPosts.current();
      const actor = obMainActor.current();
      if (actor !== nothing && !isRefreshing) {
        mutMyPosts.notify({ messages, isRefreshing: true });
        const timestamp = messages[0]?.time ?? BigInt(0);
        const newMessages = await actor.posts(timestamp);
        newMessages.sort((a, b) =>
          a.time > b.time ? -1 : a.time < b.time ? 1 : 0
        );
        mutMyPosts.notify({
          messages: [...newMessages, ...messages],
          isRefreshing: false,
        });
      }
    };
    return { update };
  }
);

export const obNewPost = encapsulated(
  nothing as Maybe<Message>,
  (mutNewPost) => {
    const post = async (content: string) => {
      const newPost = mutNewPost.current();
      const author = obPrincipal.current();
      const actor = obMainActor.current();
      if (actor !== nothing && newPost === nothing && author !== nothing) {
        mutNewPost.notify(
          just({
            content,
            time: BigInt(Date.now()),
            author,
          })
        );
        await actor.post(content);
        const unsub = obMyPosts.subscribe(({ isRefreshing }) => {
          if (!isRefreshing) {
            mutNewPost.notify(nothing);
            unsub();
          }
        });
        obMyPosts.update();
      }
    };
    return { post };
  }
);
