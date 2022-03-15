import { AuthenticatedViewProps } from "./IIAuth";
import { Lesson5 } from "../../../declarations/Lesson5";

export default function ({
  identity,
  logout,
}: AuthenticatedViewProps): JSX.Element {
  return (
    <div>
      Identity: {identity.getPrincipal().toString()}
      <button onClick={logout}>Logout</button>
    </div>
  );
}
