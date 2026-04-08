/**
 * Lazy-loaded TON helpers that avoid bundling @ton/core on the client.
 * These functions dynamically import @ton/core only when called.
 */

export async function buildComment(text: string): Promise<string> {
  const { beginCell } = await import('@ton/core');
  return beginCell()
    .storeUint(0, 32)
    .storeStringTail(text)
    .endCell()
    .toBoc()
    .toString('base64');
}

export async function parseTxHash(bocBase64: string): Promise<string> {
  const { Cell } = await import('@ton/core');
  return Cell.fromBase64(bocBase64).hash().toString('hex');
}
