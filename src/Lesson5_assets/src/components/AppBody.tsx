import { Identity } from "@dfinity/agent";
import { useCallback, useEffect, useMemo, useState } from "react";

import Microblog from "./Microblog";
import { createActor } from "../../../declarations/Lesson5";

export type AppBodyProps = {
  canisterId: string;
  identity: Identity;
};

type OwnerStatus = "Unknown" | "Unowned" | "OwnedByOthers" | "IsOwner";

export default function MicroblogAppBody({
  canisterId,
  identity,
}: AppBodyProps) {
  const [ownerStatus, setOwnerStatus] = useState<OwnerStatus>("Unknown");
  const actor = useMemo(
    () => createActor(canisterId, { agentOptions: { identity } }),
    [canisterId, identity]
  );

  const updateOwnerStatus = useCallback(async () => {
    const owner = await actor.get_owner();
    console.log(owner.toString());
    console.log(identity.getPrincipal().toString());
    if (owner.length === 0) {
      setOwnerStatus("Unowned");
    } else if (owner[0].toString() === identity.getPrincipal().toString()) {
      setOwnerStatus("IsOwner");
    } else {
      setOwnerStatus("OwnedByOthers");
    }
  }, [canisterId, actor]);

  useEffect(() => {
    setOwnerStatus("Unknown");
    updateOwnerStatus();
  }, [updateOwnerStatus]);

  const claimOwner = useCallback(async () => {
    await actor.claim_owner();
    await updateOwnerStatus();
  }, [actor, updateOwnerStatus]);

  switch (ownerStatus) {
    case "Unknown":
      return <div>Please wait ...</div>;
    case "Unowned":
      return (
        <div>
          Click <button onClick={claimOwner}>here</button> to claim ownership
        </div>
      );
    case "IsOwner":
      return (
        <div>
          <Microblog
            actor={actor}
            identity={identity}
            canisterId={canisterId}
          />
        </div>
      );
    case "OwnedByOthers":
      return (
        <div>
          <div>
            Someone else is using this canister, are you sure to seize the
            ownership?
          </div>
          <div>
            Click <button onClick={claimOwner}>here</button> to claim ownership
          </div>
        </div>
      );
  }
}
