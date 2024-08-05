import { Injectable } from '@nestjs/common';

@Injectable()
export class TokenManagerService {
  private tokenBlacklist: Set<string> = new Set();

  constructor() {}

  isTokenBlacklisted(token: string): boolean {
    return this.tokenBlacklist.has(token);
  }

  blacklistToken(token: string): void {
    this.tokenBlacklist.add(token);
  }
}
