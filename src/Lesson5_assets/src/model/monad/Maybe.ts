import { monadFor, F } from "./core";

// Construction
export const nothing = Symbol("Nothing");
export const just = <A>(a: A): Maybe<A> => a;

// As Monad
export const MaybeMonad = monadFor({
  pure: just,
  bind<A, B>(f: F<Maybe<A>, B>) {
    return (mB: Maybe<B>) => (mB === nothing ? nothing : f(mB));
  },
}) as {
  pure: Maybe_Pure;
  bind: Maybe_Bind;
  fmap: Maybe_Fmap;
  apply: Maybe_Apply;
  fmapU: Maybe_FmapU;
  applyU: Maybe_ApplyU;
  bindU: Maybe_BindU;
  chain: Maybe_Chain;
};

// Helpers
export const fromMaybe =
  <A>(a: A) =>
  (mA: Maybe<A>): A =>
    mA === nothing ? a : mA;

export const fromMaybeL =
  <A>(fa: F<A>) =>
  (mA: Maybe<A>): A =>
    mA === nothing ? fa() : mA;

// Types
export type Nothing = typeof nothing;
export type Maybe<T> = T | Nothing;

export type Maybe_Pure = <A>(a: A) => Maybe<A>;

export type Maybe_Fmap = <A, B>(f: F<A, B>) => (mB: Maybe<B>) => Maybe<A>;
export type Maybe_FmapU = <A, B>(mB: Maybe<B>, f: F<A, B>) => Maybe<A>;

export type Maybe_Apply = <A, B>(
  mf: Maybe<F<A, B>>
) => (mB: Maybe<B>) => Maybe<A>;
export type Maybe_ApplyU = <A, B>(
  mB: Maybe<B>,
  mf: Maybe<(b: B) => A>
) => Maybe<A>;

export type Maybe_Bind = <A, B>(
  f: F<Maybe<B>, A>
) => (ma: Maybe<A>) => Maybe<B>;
export type Maybe_BindU = <A, B>(ma: Maybe<A>, f: F<Maybe<B>, A>) => Maybe<B>;

export type MaybeChain<A> = {
  value: () => Maybe<A>;
  then: <B>(f: F<Maybe<A>, Maybe<B>>) => MaybeChain<B>;
  fmap: <B>(f: F<B, A>) => MaybeChain<B>;
  apply: <B>(f: Maybe<F<B, A>>) => MaybeChain<B>;
  bind: <B>(f: F<Maybe<B>, A>) => MaybeChain<B>;
};

export type Maybe_Chain = <A>(mA: Maybe<A>) => MaybeChain<A>;
