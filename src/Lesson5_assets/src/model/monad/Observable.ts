import { AnyF, F, monadFor } from "./core";
import { dummy, notifiable, Notifiable, signal, Signal } from "./Signal";

// Constructor
export const mutable = <A>(initial: A, release: F = () => {}): Mutable<A> => {
  let value = initial;
  const current = () => value;
  const { isSubscribed, notify: n, subscribe } = notifiable<A>();
  const notify = (v: A) => value !== v && n((value = v));
  return {
    subscribe,
    isSubscribed,
    current,
    notify,
    release,
  };
};

export const encapsulated = <A, M extends Record<string, AnyF>>(
  initial: A,
  f: (m: Mutable<A>) => M
): M & Observable<A> => {
  const m = mutable(initial);
  const { subscribe, isSubscribed, current, release } = m;
  return { subscribe, isSubscribed, current, release, ...f(m) };
};

export const observable = <A>(initial: A, sA: Signal<A>): Observable<A> =>
  encapsulated(initial, ({ notify }) => ({
    release: sA.subscribe(notify),
  }));

// As Monad
export const ObservableMonad = monadFor({
  pure: <A>(a: A) => observable(a, dummy as Signal<A>),
  bind<A, B>(f: F<Observable<A>, B>) {
    return (oB: Observable<B>) => {
      let oA = f(oB.current());
      const sA = signal((notify) => {
        oA.subscribe(notify);
        const unsubscribe = oB.subscribe((b) => {
          oA.release();
          oA = f(b);
          notify(oA.current());
          oA.subscribe(notify);
        });
        return () => {
          oA.release();
          unsubscribe();
        };
      });
      return observable(oA.current(), sA);
    };
  },
}) as {
  pure: Observable_Pure;
  bind: Observable_Bind;
  fmap: Observable_Fmap;
  apply: Observable_Apply;
  fmapU: Observable_FmapU;
  applyU: Observable_ApplyU;
  bindU: Observable_BindU;
  chain: Observable_Chain;
};

// Types
export type Stateful<A> = {
  current: F<A>;
  release: F;
};

export type Mutable<A> = Notifiable<A> & Stateful<A>;
export type Observable<A> = Signal<A> & Stateful<A>;

export type Observable_Pure = <A>(a: A) => Observable<A>;

export type Observable_Fmap = <A, B>(
  f: F<A, B>
) => (mB: Observable<B>) => Observable<A>;
export type Observable_FmapU = <A, B>(
  mB: Observable<B>,
  f: F<A, B>
) => Observable<A>;

export type Observable_Apply = <A, B>(
  mf: Observable<F<A, B>>
) => (mB: Observable<B>) => Observable<A>;
export type Observable_ApplyU = <A, B>(
  mB: Observable<B>,
  mf: Observable<(b: B) => A>
) => Observable<A>;

export type Observable_Bind = <A, B>(
  f: F<Observable<B>, A>
) => (ma: Observable<A>) => Observable<B>;
export type Observable_BindU = <A, B>(
  ma: Observable<A>,
  f: F<Observable<B>, A>
) => Observable<B>;

export type ObservableChain<A> = {
  value: () => Observable<A>;
  then: <B>(f: F<Observable<A>, Observable<B>>) => ObservableChain<B>;
  fmap: <B>(f: F<B, A>) => ObservableChain<B>;
  apply: <B>(f: Observable<F<B, A>>) => ObservableChain<B>;
  bind: <B>(f: F<Observable<B>, A>) => ObservableChain<B>;
};

export type Observable_Chain = <A>(mA: Observable<A>) => ObservableChain<A>;
