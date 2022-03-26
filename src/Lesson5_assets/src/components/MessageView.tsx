export type MessageViewProps = {
  content: string;
  time: bigint;
  author: string;
  onFilter: () => void;
};
export default ({ content, time, author, onFilter }: MessageViewProps) => {
  return (
    <div>
      <div>Content: {content}</div>
      <div>
        Author: <a onClick={onFilter}>{author}</a>
      </div>
      <div>Timestamp: {new Date(Number(time) / 1000000).toLocaleString()}</div>
    </div>
  );
};
