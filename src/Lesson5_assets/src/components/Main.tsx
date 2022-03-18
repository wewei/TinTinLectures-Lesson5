import { AuthenticatedViewProps } from "./IIAuth";
import { obPrincipal, obOwner, obMainActor, obIdentity } from "../model/Agent";
import Microblog from "./Microblog";
import { useObservable } from "../hooks/Observable";
import { nothing } from "../model/monad/Maybe";
import { useEffect } from "react";

export default function ({
  identity,
  logout,
}: AuthenticatedViewProps): JSX.Element {
  const owner = useObservable(obOwner);
  const actor = useObservable(obMainActor);
  const principal = useObservable(obPrincipal);

  useEffect(() => {
    obIdentity.set(identity);
    obOwner.update();
  }, [obIdentity, identity]);

  if (owner === nothing) {
    return (
      <div>
        Click <button onClick={obOwner.update}>here</button> to claim ownership
      </div>
    );
  }

  if (owner.toString() === principal.toString()) {
    return <Microblog actor={actor} />;
  }

  return (
    <div>
      <div>
        Someone else is using this canister, are you sure to seize the
        ownership?
      </div>
      <div>
        Click <button onClick={obOwner.update}>here</button> to claim ownership
      </div>
    </div>
  );
}
