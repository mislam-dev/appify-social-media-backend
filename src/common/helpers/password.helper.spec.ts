import { PasswordHelper } from './password.helper';

describe('PasswordHelper', () => {
  let helper: PasswordHelper;

  beforeEach(() => {
    helper = new PasswordHelper();
  });

  describe('hash', () => {
    it('should return a hashed string different from the plain password', async () => {
      const plain = 'mypassword';
      const hashed = await helper.hash(plain);
      expect(hashed).not.toBe(plain);
      expect(typeof hashed).toBe('string');
      expect(hashed.length).toBeGreaterThan(0);
    });

    it('should produce different hashes for the same password (bcrypt salting)', async () => {
      const hash1 = await helper.hash('password');
      const hash2 = await helper.hash('password');
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('verify', () => {
    it('should return true when the password matches the hash', async () => {
      const plain = 'securepassword';
      const hashed = await helper.hash(plain);
      const result = await helper.verify(plain, hashed);
      expect(result).toBe(true);
    });

    it('should return false when the password does not match the hash', async () => {
      const hashed = await helper.hash('correctpassword');
      const result = await helper.verify('wrongpassword', hashed);
      expect(result).toBe(false);
    });

    it('should return false for an empty string against a real hash', async () => {
      const hashed = await helper.hash('somepassword');
      const result = await helper.verify('', hashed);
      expect(result).toBe(false);
    });
  });
});
