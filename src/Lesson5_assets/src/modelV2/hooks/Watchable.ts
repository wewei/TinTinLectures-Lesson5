import { useState } from "react";
import { Watchable } from "../Watchable";

export const useWatchable = <A>(wat: Watchable<A>): A => {
  const [v, setV] = useState(0);
  return wat.watch(() => setV((i) => i + 1));
};
