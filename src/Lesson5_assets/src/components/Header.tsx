import { useCallback, useEffect } from "react";
import { useObservable } from "../hooks/Observable";
import { F } from "../model/monad/core";
import { MaybeMonad as M } from "../model/monad/Maybe";
import { obMyName } from "../model/Name";
import { obFollowees } from "../model/Timeline";

export type HeaderProps = { logout: F<void, any> };
export default ({ logout }: HeaderProps) => {
  const name = useObservable(obMyName);
  useEffect(() => {
    obMyName.update();
  }, []);

  const updateName = useCallback(
    () =>
      M.fmapU(name, (n) => {
        const newName = prompt("Please enter the new name:", n) ?? n;
        if (newName && newName !== n) {
          obMyName.set(newName);
        }
      }),
    [name]
  );

  const follow = useCallback(() => {
    const cId = prompt("Please enter the canister ID:") ?? "";
    if (cId) {
      obFollowees.follow(cId);
    }
  }, []);

  return (
    <div>
      <span onClick={updateName}>{name}</span>
      <span>&nbsp;</span>
      <button onClick={follow}>follow</button>
      <span>&nbsp;</span>
      <button onClick={logout}>Logout</button>
    </div>
  );
};
