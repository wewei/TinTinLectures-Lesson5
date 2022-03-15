import { useEffect, useMemo, useState } from "react";
import { Principal } from "@dfinity/principal";

import { AuthenticatedViewProps } from "./IIAuth";
import { withIdentity } from "../Agent";

export default function ({
  identity,
  logout,
}: AuthenticatedViewProps): JSX.Element {
  const principal = useMemo(() => identity.getPrincipal(), [identity]);
  const agent = useMemo(() => withIdentity(identity), [identity]);
  const ownerAgent = useMemo(agent, [agent]);
  const [owner, setOwner] = useState<
    Principal | "Pending" | "Unowned" | "Error"
  >("Pending");

  useEffect(() => {
    ownerAgent.get_owner().then(
      (value) => setOwner(value[0] ?? "Unowned"),
      () => setOwner("Error")
    );
  }, [ownerAgent]);
  const claim = () => {
    setOwner("Pending");
    ownerAgent.claim_owner().then(
      () => setOwner(principal),
      () => setOwner("Error")
    );
  };

  if (owner === "Error") {
    return <div>Failed to get/claim the owner</div>;
  }

  if (owner === "Pending") {
    return <div>Please wait ...</div>;
  }

  if (owner === "Unowned") {
    return (
      <div>
        Click <button onClick={claim}>here</button> to claim ownership
      </div>
    );
  }

  if (owner.toString() === principal.toString()) {
    return <div>TODO</div>;
  }

  return (
    <div>
      <div>
        Someone else is using this canister, are you sure to seize the
        ownership?
      </div>
      <div>
        Click <button onClick={claim}>here</button> to claim ownership
      </div>
      ;
    </div>
  );
}
