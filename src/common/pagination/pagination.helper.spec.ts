import { PaginationHelper } from './pagination.helper';

describe('PaginationHelper', () => {
  let helper: PaginationHelper;

  beforeEach(() => {
    helper = new PaginationHelper();
  });

  describe('meta', () => {
    it('should return correct meta object with total, page, and limit', () => {
      const meta = helper.meta(100, 2, 10);
      expect(meta).toEqual({ total: 100, page: 2, limit: 10 });
    });

    it('should handle zero total', () => {
      const meta = helper.meta(0, 1, 10);
      expect(meta).toEqual({ total: 0, page: 1, limit: 10 });
    });
  });

  describe('links', () => {
    it('should return null for both prev and next on a single page result', () => {
      const links = helper.links('/posts', 1, 10, 5);
      expect(links.prev).toBeNull();
      expect(links.next).toBeNull();
    });

    it('should return null for both prev and next when total is zero', () => {
      const links = helper.links('/posts', 1, 10, 0);
      expect(links.prev).toBeNull();
      expect(links.next).toBeNull();
    });

    it('should return a prev link when not on the first page', () => {
      const links = helper.links('/posts', 2, 10, 25);
      expect(links.prev).toBe('/posts?page=1&limit=10');
    });

    it('should return a next link when there are more pages', () => {
      const links = helper.links('/posts', 1, 10, 25);
      expect(links.next).toBe('/posts?page=2&limit=10');
    });

    it('should return both prev and next when in the middle of pagination', () => {
      const links = helper.links('/posts', 2, 10, 30);
      expect(links.prev).toBe('/posts?page=1&limit=10');
      expect(links.next).toBe('/posts?page=3&limit=10');
    });

    it('should return null for next on the last page', () => {
      const links = helper.links('/posts', 3, 10, 30);
      expect(links.next).toBeNull();
      expect(links.prev).toBe('/posts?page=2&limit=10');
    });

    it('should correctly embed the path in the link URLs', () => {
      const links = helper.links('/comments/c-uuid/replies', 1, 5, 10);
      expect(links.next).toBe('/comments/c-uuid/replies?page=2&limit=5');
    });
  });
});
