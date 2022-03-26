import { useCallback, useEffect, useMemo, useState } from "react";
import { MicroblogActor } from "../model/Agent";
import { Maybe, MaybeMonad as M, nothing } from "../model/monad/Maybe";
import MessageView from "./MessageView";
import { Button, Grid, Input, TextField } from "@mui/material";
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
};
const compareMessages = ({ time: timeA }: Message, { time: timeB }: Message) =>
  timeA > timeB ? -1 : timeA < timeB ? 1 : 0;

export default ({ actor: actorMain, canisterId, identity }: MicroblogProps) => {
  const [messages, setMessages] = useState<Map<string, Message[]>>(Map());
  const [content, setContent] = useState("");
  const [newPost, setNewPost] = useState<Maybe<Message>>(nothing);
  const [followees, setFollowees] = useState<Set<string>>(Set());
  const [nameMap, setNameMap] = useState<Map<string, string>>(Map());
  const [newName, setNewName] = useState(canisterId);
  const [followDialogOpen, setFollowDialogOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const allMessages = useMemo(
    () =>
      ([] as Message[])
        .concat(...messages.toArray().map(([, messages]) => messages))
        .sort(compareMessages),
    [messages]
  );
  const actorFor = useCallback(
    (cid: string) => createActor(cid, { agentOptions: { identity } }),
    [identity]
  );

  const post = useCallback(async () => {
    setNewPost({
      content,
      time: BigInt(Date.now()),
      author: Principal.from(canisterId),
    });
    setContent("");
    setFilter("");
    await actorMain.post(content);
    await refreshTimeline();
    setNewPost(nothing);
  }, [actorMain, content, canisterId]);

  const follow = useCallback(
    async (followee: string) => {
      setFollowDialogOpen(false);
      if (!followees.has(followee)) {
        setFollowees((followees) => followees.add(followee));
        await actorMain.follow(Principal.from(followee));
        const name = await actorFor(followee).get_name();
        setNameMap((nameMap) => nameMap.set(followee, name));
      }
      await refreshTimeline();
    },
    [followees, actorMain, actorFor]
  );

  const refreshFollowees = useCallback(async () => {
    setFollowees(
      Set(await actorMain.follows()).map((followee) => followee.toString())
    );
  }, [actorMain]);

  const refreshTimeline = useCallback(async () => {
    followees.add(canisterId).forEach(async (canisterId) => {
      const msgs = messages.get(canisterId) ?? [];
      const timestamp = msgs.length > 0 ? msgs[0].time : BigInt(0);
      const newMsgs = (await actorFor(canisterId).posts(timestamp)).sort(
        compareMessages
      );
      if (newMsgs.length > 0) {
        setMessages((messages) =>
          messages.set(canisterId, msgs.concat(newMsgs))
        );
      }
    });
  }, [canisterId, followees]);

  const refreshMyName = useCallback(async () => {
    const name = await actorMain.get_name();
    setNameMap((nameMap) => nameMap.set(canisterId, name));
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

  const refreshNames = useCallback(async () => {
    followees.forEach(async (followee) => {
      const name = await actorFor(followee).get_name();
      setNameMap((nameMap) => nameMap.set(followee, name));
    });
  }, [followees, actorFor]);

  useEffect(() => {
    refreshMyName();
  }, [refreshMyName]);

  useEffect(() => {
    refreshFollowees();
  }, [refreshFollowees]);

  useEffect(() => {
    refreshTimeline();
  }, [refreshTimeline]);

  useEffect(() => {
    refreshNames();
  }, [refreshNames]);

  return (
    <div>
      <Grid container>
        <Grid item xs={3}>
          Change your name:
        </Grid>
        <Grid item xs={3}>
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            fullWidth
          />
        </Grid>
        <Grid item xs={6}>
          <Button onClick={updateMyName}>Update Name</Button>
          <Button onClick={reset}>Reset</Button>
          <Button onClick={() => setFollowDialogOpen(true)}>Follow</Button>
        </Grid>
      </Grid>
      <FollowDialog
        open={followDialogOpen}
        onCancel={() => setFollowDialogOpen(false)}
        onConfirm={follow}
      />
      <Grid container>
        <Grid item xs={2}>
          Type here:
        </Grid>
        <Grid item xs={9}>
          <Input
            value={content}
            onChange={(p) => setContent(p.target.value)}
            fullWidth
          />
        </Grid>
        <Grid item xs={1}>
          <Button
            onClick={post}
            disabled={content === "" || newPost !== nothing}
          >
            Post
          </Button>
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid item xs={9}>
          {filter && (
            <div>
              Filter: {nameMap.get(filter) ?? filter},{" "}
              <a onClick={() => setFilter("")}>show all</a>
            </div>
          )}
          <ul>
            {M.fmapU(newPost, ({ content, time, author }) => (
              <li style={{ backgroundColor: "pink" }}>
                <MessageView
                  content={content}
                  time={time}
                  author={nameMap.get(author.toString()) || author.toString()}
                  onFilter={() => setFilter(author.toString())}
                />
              </li>
            ))}
            {(filter ? messages.get(filter) ?? [] : allMessages).map(
              ({ content, time, author }, i, msgs) => (
                <li key={msgs.length - i}>
                  <MessageView
                    content={content}
                    time={time}
                    author={nameMap.get(author.toString()) || author.toString()}
                    onFilter={() => setFilter(author.toString())}
                  />
                </li>
              )
            )}
          </ul>
        </Grid>
        <Grid item xs={3}>
          <div>Followees:</div>
          <ul>
            {followees.map((followee) => (
              <li>
                <a onClick={() => setFilter(followee)}>
                  {nameMap.get(followee) ?? followee}
                </a>
              </li>
            ))}
          </ul>
        </Grid>
      </Grid>
    </div>
  );
};
