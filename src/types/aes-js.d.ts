declare module 'aes-js' {
  export class Counter {
    constructor(initialValue: number | Uint8Array);
  }

  export namespace ModeOfOperation {
    class ctr {
      constructor(key: Uint8Array, counter: Counter);
      encrypt(data: Uint8Array): Uint8Array;
      decrypt(data: Uint8Array): Uint8Array;
    }

    class ecb {
      constructor(key: Uint8Array);
      encrypt(data: Uint8Array): Uint8Array;
      decrypt(data: Uint8Array): Uint8Array;
    }

    class cbc {
      constructor(key: Uint8Array, iv: Uint8Array);
      encrypt(data: Uint8Array): Uint8Array;
      decrypt(data: Uint8Array): Uint8Array;
    }

    class cfb {
      constructor(key: Uint8Array, iv: Uint8Array, segmentSize?: number);
      encrypt(data: Uint8Array): Uint8Array;
      decrypt(data: Uint8Array): Uint8Array;
    }

    class ofb {
      constructor(key: Uint8Array, iv: Uint8Array);
      encrypt(data: Uint8Array): Uint8Array;
      decrypt(data: Uint8Array): Uint8Array;
    }
  }

  export namespace padding {
    namespace pkcs7 {
      function pad(data: Uint8Array): Uint8Array;
      function strip(data: Uint8Array): Uint8Array;
    }
  }

  export namespace utils {
    namespace utf8 {
      function toBytes(text: string): Uint8Array;
      function fromBytes(bytes: Uint8Array): string;
    }

    namespace hex {
      function toBytes(hex: string): Uint8Array;
      function fromBytes(bytes: Uint8Array): string;
    }
  }
}
