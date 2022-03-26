import type { AuthenticatedViewProps } from "./IIAuth";
import { Button } from "@mui/material";
import { useState } from "react";
import MicroblogAppBar from "./AppBar";
import MicroblogAppBody from "./AppBody";
import { CANISTER_ID } from "../AppMeta";

export default function ({
  identity,
  logout,
}: AuthenticatedViewProps): JSX.Element {
  const [canisterId, setCanisterId] = useState(CANISTER_ID);
  return (
    <div>
      <MicroblogAppBar
        logout={logout}
        canisterId={canisterId}
        setCanisterId={setCanisterId}
      />
      <MicroblogAppBody canisterId={canisterId} identity={identity} />
      <Button onClick={logout}>Logout</Button>
    </div>
  );
}
