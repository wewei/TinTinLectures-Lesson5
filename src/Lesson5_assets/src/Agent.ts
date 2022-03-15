// Imports and re-exports candid interface
import { Identity } from "@dfinity/agent";
import { createActor } from "../../declarations/Lesson5";

// CANISTER_ID is replaced by webpack based on node environment
export const canisterId: string = process.env.LESSON5_CANISTER_ID as string;
export const withIdentity =
  (identity: Identity) =>
  (cid: string = canisterId) =>
    createActor(cid, { agentOptions: { identity } });

export type Actor = ReturnType<ReturnType<typeof withIdentity>>;
