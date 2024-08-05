import { TokenManagerService } from './token-manager.service';

describe('TokenManagerService', () => {
  let service: TokenManagerService;

  beforeEach(() => {
    service = new TokenManagerService();
  });

  describe('isTokenBlacklisted', () => {
    it('should return false if the token is not blacklisted', () => {
      const token = 'valid-token';
      expect(service.isTokenBlacklisted(token)).toBe(false);
    });

    it('should return true if the token is blacklisted', () => {
      const token = 'blacklisted-token';
      service.blacklistToken(token);
      expect(service.isTokenBlacklisted(token)).toBe(true);
    });
  });

  describe('blacklistToken', () => {
    it('should add the token to the blacklist', () => {
      const token = 'new-token';
      service.blacklistToken(token);
      expect(service.isTokenBlacklisted(token)).toBe(true);
    });
  });
});
