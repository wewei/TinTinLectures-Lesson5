import { Principal } from "@dfinity/principal";
import { Message } from "../../../declarations/Lesson5/Lesson5.did";
import { canisterId, obMainActor, obPrincipal } from "./Agent";
import { just, Maybe, nothing } from "./monad/Maybe";
import { encapsulated } from "./monad/Observable";

export type MessageList = {
  messages: Message[];
  isRefreshing: boolean;
};

export const obMyPosts = encapsulated<MessageList>({
  messages: [],
  isRefreshing: false,
})((mutMyPosts) => {
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
});

export const obNewPost = encapsulated<Maybe<Message>>(nothing)((mutNewPost) => {
  const post = async (content: string) => {
    const newPost = mutNewPost.current();
    const actor = obMainActor.current();
    if (actor !== nothing && newPost === nothing) {
      mutNewPost.notify(
        just({
          content,
          time: BigInt(Date.now()),
          author: Principal.from(canisterId),
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
});
