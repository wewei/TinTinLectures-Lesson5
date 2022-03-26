export type MessageViewProps = {
  content: string;
  time: bigint;
  author: string;
};
export default ({ content, time, author }: MessageViewProps) => {
  return (
    <div>
      <div>Content: {content}</div>
      <div>Author: {author}</div>
    </div>
  );
};
