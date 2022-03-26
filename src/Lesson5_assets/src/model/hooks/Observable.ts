import { useEffect, useState } from "react";
import { Observable } from "../monad/Observable";

export const useObservable = <A>(oA: Observable<A>) => {
  const [state, setState] = useState<A>(oA.current());
  useEffect(() => {
    setState(oA.current());
    return oA.subscribe(setState);
  }, [oA]);
  return state;
};
