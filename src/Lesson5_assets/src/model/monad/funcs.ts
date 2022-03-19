import { F } from "./core";

export const cached = <A, B>(f: F<A, B>): F<A, B> => {
  const map = new Map<B, A>();
  return (b) => {
    if (!map.has(b)) {
      map.set(b, f(b));
    }
    return map.get(b) as A;
  };
};

export const compose =
  <A, B>(f: F<A, B>) =>
  <C>(g: F<B, C>) =>
  (c: C) =>
    f(g(c));

export const callWith =
  <B>(b: B) =>
  <A>(f: F<A, B>) =>
    f(b);
