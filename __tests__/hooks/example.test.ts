/**
 * @jest-environment node
 *
 * Example hook tests demonstrating how to test React hooks.
 * These tests use pure JavaScript testing patterns since Expo 55 preview
 * has compatibility issues with the full React Native testing pipeline.
 *
 * For component and hook testing with the React Native testing library,
 * update to a stable Expo version and use jest-expo preset with jsdom environment.
 */

describe('Hook Testing Examples', () => {
  describe('Custom Hook Pattern Tests', () => {
    // Example: Testing a simple counter hook logic
    const createCounterHook = () => {
      let count = 0;
      return {
        getCount: () => count,
        increment: () => { count += 1; },
        decrement: () => { count -= 1; },
        reset: () => { count = 0; },
      };
    };

    it('should initialize with count of 0', () => {
      const hook = createCounterHook();
      expect(hook.getCount()).toBe(0);
    });

    it('should increment count', () => {
      const hook = createCounterHook();
      hook.increment();
      expect(hook.getCount()).toBe(1);
    });

    it('should decrement count', () => {
      const hook = createCounterHook();
      hook.increment();
      hook.increment();
      hook.decrement();
      expect(hook.getCount()).toBe(1);
    });

    it('should reset count', () => {
      const hook = createCounterHook();
      hook.increment();
      hook.increment();
      hook.reset();
      expect(hook.getCount()).toBe(0);
    });
  });

  describe('Async Hook Pattern Tests', () => {
    // Example: Testing async state management logic
    const createAsyncDataHook = () => {
      let data: string | null = null;
      let loading = false;
      let error: string | null = null;

      return {
        getData: () => data,
        isLoading: () => loading,
        getError: () => error,
        fetchData: async (mockFetch: () => Promise<string>) => {
          loading = true;
          error = null;
          try {
            data = await mockFetch();
          } catch (e) {
            error = (e as Error).message;
          } finally {
            loading = false;
          }
        },
      };
    };

    it('should start with null data and not loading', () => {
      const hook = createAsyncDataHook();
      expect(hook.getData()).toBeNull();
      expect(hook.isLoading()).toBe(false);
      expect(hook.getError()).toBeNull();
    });

    it('should set data on successful fetch', async () => {
      const hook = createAsyncDataHook();
      const mockFetch = jest.fn().mockResolvedValue('test data');

      await hook.fetchData(mockFetch);

      expect(hook.getData()).toBe('test data');
      expect(hook.isLoading()).toBe(false);
      expect(hook.getError()).toBeNull();
    });

    it('should set error on failed fetch', async () => {
      const hook = createAsyncDataHook();
      const mockFetch = jest.fn().mockRejectedValue(new Error('Network error'));

      await hook.fetchData(mockFetch);

      expect(hook.getData()).toBeNull();
      expect(hook.isLoading()).toBe(false);
      expect(hook.getError()).toBe('Network error');
    });
  });

  describe('Search Hook Pattern Tests', () => {
    // Example: Testing search functionality logic
    const createSearchHook = (items: string[]) => {
      let query = '';
      let results: string[] = [];

      return {
        getQuery: () => query,
        getResults: () => results,
        setQuery: (newQuery: string) => {
          query = newQuery;
          if (newQuery.trim()) {
            results = items.filter(item =>
              item.toLowerCase().includes(newQuery.toLowerCase())
            );
          } else {
            results = [];
          }
        },
        clearSearch: () => {
          query = '';
          results = [];
        },
      };
    };

    const testItems = ['Apple', 'Banana', 'Cherry', 'Date', 'Apple Pie'];

    it('should start with empty query and results', () => {
      const hook = createSearchHook(testItems);
      expect(hook.getQuery()).toBe('');
      expect(hook.getResults()).toEqual([]);
    });

    it('should filter items based on query', () => {
      const hook = createSearchHook(testItems);
      hook.setQuery('app');
      expect(hook.getResults()).toEqual(['Apple', 'Apple Pie']);
    });

    it('should be case insensitive', () => {
      const hook = createSearchHook(testItems);
      hook.setQuery('APP');
      expect(hook.getResults()).toEqual(['Apple', 'Apple Pie']);
    });

    it('should return empty results for no matches', () => {
      const hook = createSearchHook(testItems);
      hook.setQuery('xyz');
      expect(hook.getResults()).toEqual([]);
    });

    it('should clear search', () => {
      const hook = createSearchHook(testItems);
      hook.setQuery('apple');
      expect(hook.getResults().length).toBeGreaterThan(0);

      hook.clearSearch();
      expect(hook.getQuery()).toBe('');
      expect(hook.getResults()).toEqual([]);
    });
  });
});
