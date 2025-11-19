declare module '@upstash/redis' {
  export class Redis {
    constructor(options?: any);
    incr(key: string): Promise<number>;
    expire(key: string, seconds: number): Promise<void>;
    del(key: string): Promise<void>;
  }
}

declare module 'nodemailer' {
  const nodemailer: any;
  export default nodemailer;
}
