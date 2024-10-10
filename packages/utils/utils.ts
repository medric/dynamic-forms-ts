export function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function compose<T>(...fns: Function[]): Function {
  return fns.reduce(
    (f, g) =>
      (...args: T[]) =>
        f(g(...args))
  );
}
