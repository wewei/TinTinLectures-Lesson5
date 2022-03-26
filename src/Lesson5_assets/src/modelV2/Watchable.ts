import { F } from "../model/monad/core";
import { Maybe, nothing } from "../model/monad/Maybe";

export type Transition<A, B> = F<F<A, A>, B>;
export type Effect<A, B> = F<F<void, A>, B>;
export type Equals<A> = F<F<boolean, A>, A>;

// Watchable only handle the down stream messages
// Watchable is a Monad
export type Watchable<A> = { watch: Watch<A> };
export type Watch<A> = (expire?: F) => A;

// Notifiable only handle the up stream messages
// Nofifiable is a Cofunctor

export type Notifiable<A> = { notify: Notify<A> };
export type Notify<A> = F<void, A>;

export type State<A, B> = Watchable<A> & Notifiable<B>;

const once = (callback: F) => {
  let isActive = true;
  return () => {
    if (isActive) {
      isActive = false;
      callback();
    }
  };
};

export type StateOptions<A> = {
  isEqual: (a1: A) => (a2: A) => boolean;
};

export const state = <A, B>(
  {
    initial,
    transition,
    effect = () => () => {},
    equals = (a1) => (a2) => a1 === a2,
  }: {
    initial: A;
    transition: Transition<A, B>;
    effect?: Effect<A, B>;
    equals?: Equals<A>;
  },

  options: Partial<StateOptions<A>> = {}
): State<A, B> => {
  let state = initial;
  let expire = () => {};

  const { watch } = watchable<A>((exp = () => {}) => {
    expire = exp;
    return state;
  });

  const notify = (b: B) => {
    const newState = transition(b)(state);
    effect(b)(state);
    if (!equals(state)(newState)) {
      state = newState;
      expire();
    }
  };

  return { watch, notify };
};

export const gen = <A>(
  initial: A,
  f: () => AsyncGenerator<A, A>
): Watchable<A> => {
  const { notify, watch } = simpleState(initial);
  const iter = f();
  (async () => {
    for await (const a of iter) {
      notify(a);
    }
  })();
  return { watch };
};

export const simpleState = <A>(initial: A) =>
  state<A, A>({
    initial,
    transition: (a) => () => a,
  });

export const watchable = <A>(watch: Watch<A>): Watchable<A> => {
  let state: Maybe<A> = nothing;
  let watchers = new Set<F>();

  return {
    watch: (expire?: F): A => {
      if (expire) {
        watchers.add(once(expire));
      }
      if (state === nothing) {
        state = watch(
          once(() => {
            const watchersT = watchers;
            watchers = new Set<F>();
            state = nothing;
            watchersT.forEach((expire) => expire());
          })
        );
      }
      return state;
    },
  };
};

const pure = <A>(a: A): Watchable<A> => watchable(() => a);

const fmap =
  <A, B>(f: F<B, A>) =>
  (watA: Watchable<A>): Watchable<B> =>
    watchable((expire) => f(watA.watch(expire)));

// Uncurried version
const fmapU = <A, B>(watA: Watchable<A>, f: F<B, A>): Watchable<B> =>
  fmap(f)(watA);

const apply =
  <A, B>(watF: Watchable<F<B, A>>) =>
  (watA: Watchable<A>): Watchable<B> =>
    watchable((expire) => watF.watch(expire)(watA.watch(expire)));

// Uncurried version
const applyU = <A, B>(
  watA: Watchable<A>,
  watF: Watchable<F<B, A>>
): Watchable<B> => apply(watF)(watA);

const bind =
  <A, B>(f: F<Watchable<B>, A>) =>
  (watA: Watchable<A>): Watchable<B> =>
    watchable((expire) => f(watA.watch(expire)).watch(expire));

// Uncurried version
const bindU = <A, B>(watA: Watchable<A>, f: F<Watchable<B>, A>): Watchable<B> =>
  bind(f)(watA);

export type Chain<A> = {
  fmap: <B>(f: F<B, A>) => Chain<B>;
  bind: <B>(f: F<Watchable<B>, A>) => Chain<B>;
  value: () => Watchable<A>;
};

const chain = <A>(watA: Watchable<A>): Chain<A> => ({
  fmap: <B>(f: F<B, A>): Chain<B> => chain(fmapU(watA, f)),
  bind: <B>(f: F<Watchable<B>, A>): Chain<B> => chain(bindU(watA, f)),
  value: () => watA,
});

export const WatchableMonad = {
  pure,
  fmap,
  fmapU,
  apply,
  applyU,
  bind,
  bindU,
  chain,
};

export const join = <R extends Record<string, any>>(rec: {
  [K in keyof R]: Watchable<R[K]>;
}): Watchable<R> =>
  watchable((expire) =>
    Object.keys(rec).reduce((obj, key: keyof R) => {
      obj[key] = rec[key].watch(expire);
      return obj;
    }, {} as R)
  );
