import type { AuthenticatedViewProps } from "./IIAuth";

import { useCallback, useEffect, useMemo, useState } from "react";

import Microblog from "./Microblog";
import { createActor } from "../../../declarations/Lesson5";

const CANISTER_ID = process.env.LESSON5_CANISTER_ID as string;

type OwnerStatus = "Unknown" | "Unowned" | "OwnedByOthers" | "IsOwner";

export default function ({
  identity,
  logout,
}: AuthenticatedViewProps): JSX.Element {
  const [canisterId, setCanisterId] = useState(CANISTER_ID);
  const [ownerStatus, setOwnerStatus] = useState<OwnerStatus>("Unknown");
  const actor = useMemo(
    () => createActor(canisterId, { agentOptions: { identity } }),
    [canisterId, identity]
  );

  const updateOwnerStatus = useCallback(async () => {
    const owner = await actor.get_owner();
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
  }, []);

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
            logout={logout}
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
