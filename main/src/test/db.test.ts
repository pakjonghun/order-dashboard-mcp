import { getAllUsers } from '../db/database';

describe('DB User Query', () => {
  it('should return an array (users)', () => {
    const users = getAllUsers();
    expect(Array.isArray(users)).toBe(true);
  });

  it('should return empty array if no users', () => {
    const users = getAllUsers();
    expect(users.length).toBe(0);
  });
});
