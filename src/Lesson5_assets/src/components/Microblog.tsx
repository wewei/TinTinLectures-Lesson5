import { ChangeEvent, useCallback, useEffect, useState } from "react";
import { useObservable } from "../hooks/Observable";
import { obMyPosts, obNewPost } from "../model/Message";
import { MaybeMonad as M, nothing } from "../model/monad/Maybe";
import { obFollowees, obTimeline, postsFor } from "../model/Timeline";
import MessageView from "./MessageView";

export default () => {
  const { messages, isRefreshing } = useObservable(obTimeline);
  const newPost = useObservable(obNewPost);
  const [content, setContent] = useState("");
  console.log(messages);

  useEffect(() => {
    obFollowees.update();
    obMyPosts.update();
    obFollowees.current().forEach((cId) => postsFor(cId).update());
  }, []);
  return (
    <div>
      <div>
        <input
          value={content}
          onChange={useCallback(
            (e: ChangeEvent<HTMLInputElement>) => setContent(e.target.value),
            []
          )}
        />
        <span>&nbsp;</span>
        <button
          onClick={useCallback(() => obNewPost.post(content), [content])}
          disabled={isRefreshing || newPost !== nothing}
        >
          Post
        </button>
      </div>
      <ul>
        {M.fmapU(newPost, (p) => (
          <li style={{ backgroundColor: "pink" }}>
            <MessageView message={p} />
          </li>
        ))}
        {messages.map((p, i) => (
          <li key={messages.length - i}>
            <MessageView message={p} />
          </li>
        ))}
      </ul>
    </div>
  );
};
