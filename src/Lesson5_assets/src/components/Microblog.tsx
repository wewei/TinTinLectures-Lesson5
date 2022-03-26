import { useCallback, useEffect, useMemo, useState } from "react";
import { MicroblogActor } from "../model/Agent";
import { Maybe, MaybeMonad as M, nothing } from "../model/monad/Maybe";
import MessageView from "./MessageView";
import { Button, Input, TextField } from "@mui/material";
import { Message } from "../../../declarations/Lesson5/Lesson5.did";
import { Principal } from "@dfinity/principal";
import { createActor } from "../../../declarations/Lesson5";
import { Identity } from "@dfinity/agent";
import { Map, Set } from "immutable";
import FollowDialog from "./FollowDialog";

export type MicroblogProps = {
  actor: MicroblogActor;
  canisterId: string;
  identity: Identity;
  logout: () => void;
};

export default ({
  actor: actorMain,
  canisterId,
  identity,
  logout,
}: MicroblogProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState("");
  const [newPost, setNewPost] = useState<Maybe<Message>>(nothing);
  const [followees, setFollowees] = useState<Set<string>>(Set());
  const [nameMap, setNameMap] = useState<Map<string, string>>(Map());
  const [newName, setNewName] = useState(canisterId);
  const [followDialogOpen, setFollowDialogOpen] = useState(false);
  const actorsFor = useMemo(
    () => (cid: string) => createActor(cid, { agentOptions: { identity } }),
    [identity]
  );

  const actors = useMemo(
    () => followees.map(actorsFor),
    [followees, actorsFor]
  );

  const post = useCallback(async () => {
    setNewPost({
      content,
      time: BigInt(Date.now()),
      author: Principal.from(canisterId),
    });
    setContent("");
    await actorMain.post(content);
    await refreshTimeline();
    setNewPost(nothing);
  }, [actorMain, content, canisterId]);

  const follow = useCallback(async (followee: string) => {
    if (!followees.has(followee)) {
      setFollowees(followees.add(followee));
      await actorMain.follow(Principal.from(followee));
      setNameMap(nameMap.set(followee, await actorsFor(followee).get_name()));
    }
  }, []);

  const refreshFollowees = useCallback(async () => {
    setFollowees(
      Set(await actorMain.follows()).map((followee) => followee.toString())
    );
  }, [actorMain]);

  const refreshTimeline = useCallback(async () => {
    const timestamp = messages.length > 0 ? messages[0].time : BigInt(0);
    const posts = ([] as Message[])
      .concat(
        ...(await Promise.all(
          actors.add(actorMain).map((act) => act.posts(timestamp))
        ))
      )
      .sort(({ time: timeA }, { time: timeB }) =>
        timeA > timeB ? -1 : timeA < timeB ? 1 : 0
      );
    setMessages((messages) => [...posts, ...messages]);
  }, [canisterId, actors, actorMain, messages]);

  const refreshMyName = useCallback(async () => {
    const name = await actorMain.get_name();
    setNameMap(nameMap.set(canisterId, name));
    setNewName(name);
  }, [canisterId, actorMain, nameMap]);

  const updateMyName = useCallback(async () => {
    setNameMap(nameMap.set(canisterId, newName));
    await actorMain.set_name(newName);
    await refreshMyName();
  }, [actorMain, nameMap, canisterId, newName, refreshMyName]);

  const reset = useCallback(async () => {
    await actorMain.reset();
    window.location.reload();
  }, [actorMain]);

  useEffect(() => {
    refreshTimeline();
    refreshFollowees();
    refreshMyName();
  }, []);

  return (
    <div>
      <Button onClick={logout}>Logout</Button>
      <Input value={newName} onChange={(e) => setNewName(e.target.value)} />
      <Button onClick={updateMyName}>Update Name</Button>
      <Button onClick={reset}>Reset</Button>
      <Button onClick={() => setFollowDialogOpen(true)}>Follow</Button>
      <FollowDialog
        open={followDialogOpen}
        onCancel={() => setFollowDialogOpen(false)}
        onConfirm={follow}
      />
      <div>
        <Input value={content} onChange={(p) => setContent(p.target.value)} />
        <span>&nbsp;</span>
        <button onClick={post} disabled={content === "" || newPost !== nothing}>
          Post
        </button>
      </div>
      <ul>
        {M.fmapU(newPost, ({ content, time, author }) => (
          <li style={{ backgroundColor: "pink" }}>
            <MessageView
              content={content}
              time={time}
              author={nameMap.get(author.toString()) || author.toString()}
            />
          </li>
        ))}
        {messages.map(({ content, time, author }, i) => (
          <li key={messages.length - i}>
            <MessageView
              content={content}
              time={time}
              author={nameMap.get(author.toString()) || author.toString()}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};
