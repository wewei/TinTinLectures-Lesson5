import { ChangeEvent, useCallback, useEffect, useState } from "react";
import { useObservable } from "../hooks/Observable";
import { obMyPosts, obNewPost } from "../model/Message";
import { fromMaybe, MaybeMonad as M, nothing } from "../model/monad/Maybe";
import { ObservableMonad as O } from "../model/monad/Observable";
import { nameFor } from "../model/Name";
import MessageView from "./MessageView";

export default () => {
  const { messages, isRefreshing } = useObservable(obMyPosts);
  const newPost = useObservable(obNewPost);
  const [content, setContent] = useState("");

  useEffect(() => {
    obMyPosts.update();
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
