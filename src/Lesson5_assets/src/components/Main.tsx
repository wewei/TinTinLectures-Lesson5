import { AuthenticatedViewProps } from "./IIAuth";
import { obOwner, obIdentity, obOwnerStatus } from "../model/Agent";
import Microblog from "./Microblog";
import { useObservable } from "../hooks/Observable";
import { useEffect } from "react";

export default function ({
  identity,
  logout,
}: AuthenticatedViewProps): JSX.Element {
  const ownerStatus = useObservable(obOwnerStatus);

  useEffect(() => {
    obIdentity.set(identity);
    obOwner.update();
    // setTimeout(obOwner.update, 1000);
  }, [obIdentity, identity]);

  switch (ownerStatus) {
    case "Unknown":
      return <div>Please wait ...</div>;
    case "Unowned":
      return (
        <div>
          Click <button onClick={obOwner.update}>here</button> to claim
          ownership
        </div>
      );
    case "IsOwner":
      return <Microblog />;
    case "OwnedByOthers":
      return (
        <div>
          <div>
            Someone else is using this canister, are you sure to seize the
            ownership?
          </div>
          <div>
            Click <button onClick={obOwner.update}>here</button> to claim
            ownership
          </div>
        </div>
      );
  }
}
