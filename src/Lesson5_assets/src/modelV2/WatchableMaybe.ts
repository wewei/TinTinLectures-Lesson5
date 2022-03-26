import { F } from "../model/monad/core";
import { Maybe, MaybeMonad as M, nothing } from "../model/monad/Maybe";
import { watchable, Watchable, WatchableMonad as W } from "./Watchable";

const pure = <A>(a: A): Watchable<Maybe<A>> => W.pure(M.pure(a));
const fmap = <A, B>(f: F<B, A>) => W.fmap(M.fmap(f));
const fmapU = <A, B>(wmbA: Watchable<Maybe<A>>, f: F<B, A>) => fmap(f)(wmbA);
const liftW =
  <A, B, C>(f: F<F<A, B>, C>) =>
  (watC: Watchable<C>) =>
  (watB: Watchable<B>): Watchable<A> =>
    W.applyU(watB, W.fmapU(watC, f));
const liftM =
  <A, B, C>(f: F<F<A, B>, C>) =>
  (watC: Maybe<C>) =>
  (watB: Maybe<B>): Maybe<A> =>
    M.applyU(watB, M.fmapU(watC, f));
const liftWM = <A, B, C>(f: F<F<A, B>, C>) => liftW(liftM(f));

const apply = <A, B>(wmbF: Watchable<Maybe<F<B, A>>>) =>
  liftWM<B, A, F<B, A>>((x) => x)(wmbF);
const applyU = <A, B>(
  wmbA: Watchable<Maybe<A>>,
  wmbF: Watchable<Maybe<F<B, A>>>
) => apply(wmbF)(wmbA);

const bind =
  <A, B>(f: F<Watchable<Maybe<B>>, A>) =>
  (wmbA: Watchable<Maybe<A>>): Watchable<Maybe<B>> =>
    watchable((expire) =>
      M.chain(wmbA.watch(expire))
        .fmap(f)
        .fmap((wmbB) => wmbB.watch(expire))
        .value()
    );
const bindU = <A, B>(wmbA: Watchable<Maybe<A>>, f: F<Watchable<Maybe<B>>, A>) =>
  bind(f)(wmbA);

export type Chain<A> = {
  fmap: <B>(f: F<B, A>) => Chain<B>;
  bind: <B>(f: F<Watchable<Maybe<B>>, A>) => Chain<B>;
  value: () => Watchable<Maybe<A>>;
};

export const chain = <A>(wmbA: Watchable<Maybe<A>>): Chain<A> => ({
  fmap: <B>(f: F<B, A>): Chain<B> => chain(fmapU(wmbA, f)),
  bind: <B>(f: F<Watchable<Maybe<B>>, A>): Chain<B> => chain(bindU(wmbA, f)),
  value: () => wmbA,
});

export const WatchableMaybeMonad = {
  pure,
  fmap,
  fmapU,
  apply,
  applyU,
  bind,
  bindU,
  chain,
};
