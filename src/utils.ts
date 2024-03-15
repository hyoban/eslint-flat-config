export function nonNullable<T>(value: T): value is NonNullable<T> {
  return value !== null && value !== undefined
}
export type MaybeArray<T> = T | T[]
export type Awaitable<T> = T | Promise<T>
export async function interopDefault<T>(m: Awaitable<T>): Promise<T extends { default: infer U } ? U : T> {
  const resolved = await m
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (resolved as any).default || resolved
}
