import { mockContent } from '../src/index';

describe('mockContent', () => {
  it('should imported from index', async () => {
    const content = mockContent();
    const $content = content.$content;

    const res = $content('blog').sortBy('id').fetch();
    expect($content).toHaveBeenCalledWith('blog');
    const chain = content.mockResponse([{ id: 'test' }]);
    expect(chain.count()).toEqual(1);
    expect(chain.at(0).getMockName()).toEqual('sortBy');
    expect(chain.at(0)).toHaveBeenCalledWith('id');
    expect(await res).toEqual([{ id: 'test' }]);
  });
});
