import { F, monadFor } from "./core";
import { fromMaybeL, Maybe, nothing } from "./Maybe";

// Definition
export const notifiable = <A>(): Notifiable<A> => {
  const callbacks = new Set<Notify<A>>();
  const notify: Notify<A> = (a) => callbacks.forEach((n) => n(a));
  const subscribe = (n: Notify<A>) => {
    callbacks.add(n);
    return () => callbacks.delete(n);
  };
  const isSubscribed = () => callbacks.size > 0;
  return { subscribe, isSubscribed, notify };
};

export const signal = <A>(setup: SignalSetup<A>): Signal<A> => {
  let unsubscribe: Maybe<F> = nothing;
  const { subscribe, isSubscribed, notify } = notifiable<A>();
  return {
    isSubscribed,
    subscribe(n) {
      const unob = subscribe(n);
      unsubscribe = fromMaybeL(() => setup(notify))(unsubscribe);
      return () => {
        unob();
        if (!isSubscribed() && unsubscribe !== nothing) {
          unsubscribe();
          unsubscribe = nothing;
        }
      };
    },
  };
};

export const dummy = signal(() => () => {});

export const SignalMonad = monadFor({
  pure<A>(a: A): Signal<A> {
    return signal((notify) => {
      notify(a);
      return () => {};
    });
  },
  bind<A, B>(f: F<Signal<A>, B>) {
    return (mB: Signal<B>): Signal<A> =>
      signal((notify) => mB.subscribe((b) => f(b).subscribe(notify)));
  },
}) as {
  pure: Signal_Pure;
  bind: Signal_Bind;
  fmap: Signal_Fmap;
  apply: Signal_Apply;
  fmapU: Signal_FmapU;
  applyU: Signal_ApplyU;
  bindU: Signal_BindU;
  chain: Signal_Chain;
};

// Types

export type Notify<A> = F<void, A>;
export type SignalSetup<A> = F<F, Notify<A>>;

export type Notifiable<A> = Signal<A> & { notify: Notify<A> };

export type Signal<A> = {
  subscribe(n: Notify<A>): F;
  isSubscribed(): boolean;
};

export type Signal_Pure = <A>(a: A) => Signal<A>;

export type Signal_Fmap = <A, B>(f: F<A, B>) => (mB: Signal<B>) => Signal<A>;
export type Signal_FmapU = <A, B>(mB: Signal<B>, f: F<A, B>) => Signal<A>;

export type Signal_Apply = <A, B>(
  mf: Signal<F<A, B>>
) => (mB: Signal<B>) => Signal<A>;
export type Signal_ApplyU = <A, B>(
  mB: Signal<B>,
  mf: Signal<(b: B) => A>
) => Signal<A>;

export type Signal_Bind = <A, B>(
  f: F<Signal<B>, A>
) => (ma: Signal<A>) => Signal<B>;
export type Signal_BindU = <A, B>(
  ma: Signal<A>,
  f: F<Signal<B>, A>
) => Signal<B>;

export type SignalChain<A> = {
  value: () => Signal<A>;
  then: <B>(f: F<Signal<A>, Signal<B>>) => SignalChain<B>;
  fmap: <B>(f: F<B, A>) => SignalChain<B>;
  apply: <B>(f: Signal<F<B, A>>) => SignalChain<B>;
  bind: <B>(f: F<Signal<B>, A>) => SignalChain<B>;
};

export type Signal_Chain = <A>(mA: Signal<A>) => SignalChain<A>;
