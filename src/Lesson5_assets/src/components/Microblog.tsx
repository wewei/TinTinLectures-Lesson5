import { ChangeEvent, useCallback, useEffect, useState } from "react";
import { useObservable } from "../hooks/Observable";
import { obMyPosts, obNewPost } from "../model/Message";
import { MaybeMonad as M, nothing } from "../model/monad/Maybe";

export default () => {
  const { messages, isRefreshing } = useObservable(obMyPosts);
  const newPost = useObservable(obNewPost);
  const [content, setContent] = useState("");
  useEffect(() => {
    obMyPosts.update();
  }, []);
  console.log("render", newPost, isRefreshing, messages);
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
            <div>Content: {p.content}</div>
            <div>Author: {p.author.toString()}</div>
          </li>
        ))}
        {messages.map(({ content, author }, i) => (
          <li key={messages.length - i}>
            <div>Content: {content}</div>
            <div>Author: {author.toString()}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};
