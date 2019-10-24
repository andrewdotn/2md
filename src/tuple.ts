/**
 * Convenience function to create type from a static list.
 *
 *     > foo = tuple('a', 'b', 'c')
 *     ['a', 'b', 'c']
 *     > type Foo = typeof foo[number]
 *     'a' | 'b' | 'c'
 *
 * Taken from https://stackoverflow.com/a/54071129/14558
 */
export function tuple<T extends string[]>(...o: T) {
  return o;
}
