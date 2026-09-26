declare module 'sloc' {
  type Stats = {
    total: number;
    source: number;
    comment: number;
    single: number;
    block: number;
    mixed: number;
    empty: number;
    todo: number;
  };

  type Sloc = ((code: string, extension: string) => Stats) & { readonly extensions: readonly string[] };

  const sloc: Sloc;

  export default sloc;
}
