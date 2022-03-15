import { render } from "react-dom";

import IIAuth, { AnonymousViewProps } from "./components/IIAuth";
import MicroblogView from "./components/MicroblogView";

function AnonymousView({ login, error }: AnonymousViewProps): JSX.Element {
  return (
    <div>
      <button onClick={login}>Login</button>
      {error && <span>{error}</span>}
    </div>
  );
}

function PreparingView(): JSX.Element {
  return <div>Preparing...</div>;
}

function AuthenticatingView(): JSX.Element {
  return <div>Authenticating...</div>;
}

const identityProvider =
  process.env.NODE_ENV === "development"
    ? `http://${process.env.INTERNET_IDENTITY_CANISTER_ID}.localhost:8000`
    : `https://identity.ic0.app`;

render(
  <IIAuth
    AuthenticatedView={MicroblogView}
    AnonymousView={AnonymousView}
    PreparingView={PreparingView}
    AuthenticatingView={AuthenticatingView}
    identityProvider={identityProvider}
  />,
  document.getElementById("main")
);

// document.querySelector("form").addEventListener("submit", async (e) => {
//   e.preventDefault();
//   const button = e.target.querySelector("button");

//   const name = document.getElementById("name").value.toString();

//   button.setAttribute("disabled", true);

//   // Interact with foo actor, calling the greet method
//   const greeting = await Lesson5.greet(name);

//   button.removeAttribute("disabled");

//   document.getElementById("greeting").innerText = greeting;

//   return false;
// });
