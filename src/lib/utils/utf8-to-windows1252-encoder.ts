export function getArrayBuffer(data: string): ArrayBuffer {
  var len = data.length,
    ab = new ArrayBuffer(len),
    u8 = new Uint8Array(ab);

  while (len--) u8[len] = data.charCodeAt(len);
  return ab;
}
