type MockFn = jest.Mock<any, any>;

const MockNamesValues = [
  'only',
  'without',
  'where',
  'sortBy',
  'limit',
  'skip',
  'search',
  'surround'
] as const;
type MockNames = typeof MockNamesValues[number];
type Mocks = Record<MockNames, MockFn>;

type ChainItem = MockFn;
type Chain = ChainItem[];
type ChainList = {
  count: () => number;
  at: (idx: number) => ChainItem;
  find: (name: MockNames) => ChainItem;
  findAll: (name: MockNames) => ChainList;
};
function setupChainList(chain: Chain): ChainList {
  return {
    count(): number {
      return chain.length;
    },
    at(idx: number): ChainItem {
      return chain[idx];
    },
    find(name: MockNames): ChainItem {
      const idx = chain.findIndex((c) => c.getMockName() === name);
      if (idx < 0) {
        throw new Error(`${name} mock is not exist in chain`);
      }
      return chain[idx];
    },
    findAll(name: MockNames): ChainList {
      return setupChainList(chain.filter((c) => c.getMockName() === name));
    }
  };
}

type FetchQueItem = [
  Chain | undefined,
  ((value: unknown) => void) | undefined,
  ((reason?: any) => void) | undefined
];
function setupFetchQue() {
  const que: FetchQueItem[] = [];
  return {
    // reset() {
    //   que.splice(0);
    // },
    push(f: FetchQueItem) {
      que.push(f);
    },
    shift(): FetchQueItem {
      const item = que.shift();
      if (item) {
        return item;
      }
      return [undefined, undefined, undefined];
    }
  };
}

function setupMocks(chain: Chain, fetch: MockFn): Mocks & { fetch: MockFn } {
  const mocks: Mocks = {
    only: jest.fn(),
    without: jest.fn(),
    where: jest.fn(),
    sortBy: jest.fn(),
    limit: jest.fn(),
    skip: jest.fn(),
    search: jest.fn(),
    surround: jest.fn()
  };
  MockNamesValues.forEach((k) => {
    const impl = function (): Mocks & { fetch: MockFn } {
      mocks[k].mockName(k);
      chain.push(mocks[k]);
      mocks[k] = jest.fn(impl);
      return {
        ...mocks,
        fetch
      };
    };
    mocks[k].mockImplementation(impl);
  });
  return {
    ...mocks,
    fetch
  };
}

// export type ContetMockOptions = {
//   keepCalled: boolean;
// };

export default function mockContent() {
  const fetchQue = setupFetchQue();
  const mockContent = jest.fn();

  const _setup = function () {
    mockContent.mockReset().mockImplementation(() => {
      const _chain: Chain = [];
      const mockFetch = jest.fn().mockImplementation(async () => {
        return await new Promise((resolve, reject) => {
          fetchQue.push([_chain, resolve, reject]);
        });
      });
      return {
        ...setupMocks(_chain, mockFetch)
      };
    });
  };

  _setup();

  return {
    $content: mockContent,
    mockResponse: (res: any): Promise<ChainList> => {
      const [chain, resolve] = fetchQue.shift();
      if (chain === undefined || resolve === undefined) {
        throw new Error('No request to respond to!');
      }
      resolve(res);
      return new Promise((resolve) =>
        // setImmediate is not defined in jsdom env.
        // setImmediate(() => resolve(setupChainList(chain)))
        setTimeout(() => resolve(setupChainList(chain)), 0)
      );
    },
    mockError: (reason: any): Promise<ChainList> => {
      const [chain, _resolve, reject] = fetchQue.shift();
      if (chain === undefined || reject === undefined) {
        throw new Error('No request to respond to!');
      }
      reject(reason);
      return new Promise((resolve) =>
        setTimeout(() => resolve(setupChainList(chain)), 0)
      );
    }
  };
}
