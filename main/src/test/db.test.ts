import { getAllOrders } from '../db/database';

describe('DB Order Query', () => {
  it('should return an array (orders)', () => {
    const orders = getAllOrders();
    expect(Array.isArray(orders)).toBe(true);
  });

  it('should return empty array if no orders', () => {
    const orders = getAllOrders();
    expect(orders.length).toBe(0);
  });
});
