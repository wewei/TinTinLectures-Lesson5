import { Message } from "../../../declarations/Lesson5/Lesson5.did";
import { useObservable } from "../hooks/Observable";
import { fromMaybe } from "../model/monad/Maybe";
import { ObservableMonad as O } from "../model/monad/Observable";
import { nameFor } from "../model/Name";

export type MessageViewProps = { message: Message };
export default ({ message: { content, time, author } }: MessageViewProps) => {
  return (
    <div>
      <div>Content: {content}</div>
      <div>
        Author:{" "}
        {useObservable(
          O.fmapU(nameFor(author.toString()), fromMaybe("Loading ..."))
        )}
      </div>
    </div>
  );
};
