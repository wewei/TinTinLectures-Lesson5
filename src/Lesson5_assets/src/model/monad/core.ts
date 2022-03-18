export type F<A = void, B = void> = (a: B) => A;
export type AnyF = F<any, any>;
type AnyF2 = F<AnyF, any>;
type AnyMonad = { pure: AnyF; bind: AnyF2 };

const applyForMonad =
  ({ pure, bind }: AnyMonad) =>
  (mf: any) =>
    bind((a: any) => bind((f: AnyF) => pure(f(a)))(mf));

const fmapForMonad =
  ({ pure, bind }: AnyMonad) =>
  (f: AnyF): AnyF =>
    bind((s: any) => pure(f(s)));

export const monadFor = ({ pure, bind }: AnyMonad) => {
  const apply = applyForMonad({ pure, bind });
  const fmap = fmapForMonad({ pure, bind });

  const applyU = (mB: any, mF: any) => apply(mF)(mB);
  const fmapU = (mB: any, f: AnyF) => fmap(f)(mB);
  const bindU = (mB: any, f: AnyF) => bind(f)(mB);

  const chain = (mA: any) => ({
    value: () => mA,
    then: (f: AnyF) => chain(f(mA)),
    fmap: (f: AnyF) => chain(fmap(f)(mA)),
    apply: (mF: any) => chain(apply(mF)(mA)),
    bind: (f: AnyF) => chain(bind(f)(mA)),
  });
  return { pure, bind, apply, fmap, fmapU, applyU, bindU, chain };
};
