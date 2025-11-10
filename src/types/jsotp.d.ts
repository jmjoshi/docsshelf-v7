declare module 'jsotp' {
  export interface TOTPInstance {
    now(): string;
    verify(token: string, time?: number): boolean;
  }

  export interface HOTPInstance {
    at(counter: number): string;
    verify(otp: string, counter: number): boolean;
  }

  export function TOTP(secret: string, interval?: number): TOTPInstance;
  export function HOTP(secret: string, digits?: number, digest?: string): HOTPInstance;
  
  export class Base32 {
    static decode(input: string): string;
    static random_gen(length?: number): string;
  }
}
