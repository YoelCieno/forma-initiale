export function mockOkResponse(data: unknown) {
  return { ok: true, json: () => Promise.resolve(data) }
}
