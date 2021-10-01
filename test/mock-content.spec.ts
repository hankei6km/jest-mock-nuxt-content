import mockContent from '../src/mock-content';

describe('mockContent', () => {
  const mockDataBlog = [
    { id: 'id1', title: 'title1', description: 'text1' },
    { id: 'id2', title: 'title2', description: 'text2' },
    { id: 'id3', title: 'title3', description: 'text3' }
  ];

  it('should return response from mnockResponse()', async () => {
    const content = mockContent();
    const $content = content.$content;

    const res = $content('blog').fetch();
    content.mockResponse(mockDataBlog);
    expect(await res).toEqual(mockDataBlog);
  });

  it('should isolate each mocked methods in chain', async () => {
    const content = mockContent();
    const $content = content.$content;

    const res = $content('blog')
      .sortBy('id')
      .only(['title'])
      .sortBy('title')
      .fetch();
    const chain = await content.mockResponse(mockDataBlog);
    expect(chain.count()).toEqual(3);

    expect(chain.at(0).getMockName()).toEqual('sortBy');
    expect(chain.at(0)).toHaveBeenCalledTimes(1);
    expect(chain.at(0)).toHaveBeenLastCalledWith('id');

    expect(chain.at(1).getMockName()).toEqual('only');
    expect(chain.at(1)).toHaveBeenCalledTimes(1);
    expect(chain.at(1)).toHaveBeenLastCalledWith(['title']);

    expect(chain.at(2).getMockName()).toEqual('sortBy');
    expect(chain.at(2)).toHaveBeenCalledTimes(1);
    expect(chain.at(2)).toHaveBeenLastCalledWith('title');

    expect(await res).toEqual(mockDataBlog);
  });

  it('should return responses in step by step', async () => {
    const content = mockContent();
    const $content = content.$content;

    const res = (async () => {
      const res1 = await $content('blog').sortBy('id').fetch();
      return await $content('blog', res1[1].id).fetch();
    })();

    expect($content).toHaveBeenCalledWith('blog');
    const chain1 = await content.mockResponse(mockDataBlog);
    expect(chain1.count()).toEqual(1);
    expect(chain1.at(0)).toHaveBeenCalledWith('id');

    expect($content).toHaveBeenCalledWith('blog', 'id2');
    const chain2 = await content.mockResponse(mockDataBlog[1]);
    expect(chain2.count()).toEqual(0);
    expect(await res).toEqual(mockDataBlog[1]);
  });

  it('should chain each methods called', async () => {
    const content = mockContent();
    const $content = content.$content;

    const res = $content('blog')
      .only()
      .without()
      .where()
      .sortBy()
      .limit()
      .skip()
      .search()
      .surround()
      .fetch();
    const chain = await content.mockResponse(mockDataBlog);
    expect(chain.count()).toEqual(8);
    expect(chain.at(0).getMockName()).toEqual('only');
    expect(chain.at(1).getMockName()).toEqual('without');
    expect(chain.at(2).getMockName()).toEqual('where');
    expect(chain.at(3).getMockName()).toEqual('sortBy');
    expect(chain.at(4).getMockName()).toEqual('limit');
    expect(chain.at(5).getMockName()).toEqual('skip');
    expect(chain.at(6).getMockName()).toEqual('search');
    expect(chain.at(7).getMockName()).toEqual('surround');
    expect(await res).toEqual(mockDataBlog);
  });

  it('should return the mock from chain by find()', async () => {
    const content = mockContent();
    const $content = content.$content;

    const res = $content('blog').sortBy('id').only(['title']).fetch();
    expect($content).toHaveBeenCalledWith('blog');
    const chain = await content.mockResponse(mockDataBlog);
    expect(chain.find('only')).toHaveBeenCalledWith(['title']);
    expect(await res).toEqual(mockDataBlog);
  });

  it('should return mocks from chain by findAll()', async () => {
    const content = mockContent();
    const $content = content.$content;

    const res = $content('blog').sortBy('id').limit(10).sortBy('title').fetch();
    expect($content).toHaveBeenCalledWith('blog');
    const chain = await content.mockResponse(mockDataBlog);
    const sortBy = chain.findAll('sortBy');
    expect(sortBy.count()).toEqual(2);
    expect(sortBy.at(0)).toHaveBeenCalledWith('id');
    expect(sortBy.at(1)).toHaveBeenCalledWith('title');
    const skip = chain.findAll('skip');
    expect(skip.count()).toEqual(0);
    expect(await res).toEqual(mockDataBlog);
  });

  it('should return values from fetch() calls in parallel', async () => {
    const content = mockContent();
    const $content = content.$content;

    const res1 = $content('blog', 'id1').only(['title']).fetch();
    const res2 = $content('blog', 'id2').only(['id']).fetch();
    const res3 = $content('blog', 'id3').only(['description']).fetch();
    const chain1 = await content.mockResponse({ title: mockDataBlog[0].title });
    const chain2 = await content.mockResponse({ id: mockDataBlog[1].id });
    const chain3 = await content.mockResponse({
      description: mockDataBlog[2].description
    });
    expect(chain1.at(0).getMockName()).toEqual('only');
    expect(chain1.at(0)).toHaveBeenCalledWith(['title']);
    expect(chain2.at(0).getMockName()).toEqual('only');
    expect(chain2.at(0)).toHaveBeenCalledWith(['id']);
    expect(chain3.at(0).getMockName()).toEqual('only');
    expect(chain3.at(0)).toHaveBeenCalledWith(['description']);
    expect(await Promise.all([res1, res2, res3])).toEqual([
      { title: mockDataBlog[0].title },
      { id: mockDataBlog[1].id },
      { description: mockDataBlog[2].description }
    ]);

    const res = $content('blog').sortBy('id').fetch();
    const chain = await content.mockResponse(mockDataBlog);
    expect(chain.at(0).getMockName()).toEqual('sortBy');
    expect(chain.at(0)).toHaveBeenCalledWith('id');
    expect(await res).toEqual(mockDataBlog);
  });

  it('should trhow error from mockResponse() without fetch() called', async () => {
    const content = mockContent();
    const $content = content.$content;

    const res = $content('blog').sortBy('id');
    expect(() => content.mockResponse(mockDataBlog)).toThrowError(
      'No request to respond to!'
    );
  });

  it('should trhow error from mockError without fetch() called', async () => {
    const content = mockContent();
    const $content = content.$content;

    const res = $content('blog').sortBy('id');
    expect(() => content.mockError(mockDataBlog)).toThrowError(
      'No request to respond to!'
    );
  });

  it('should trhow error from mockResponse() without fetch() called(multiple mockResponse)', async () => {
    const content = mockContent();
    const $content = content.$content;

    $content('blog').sortBy('id').fetch();
    $content('blog').sortBy('id');
    content.mockResponse(mockDataBlog);
    expect(() => content.mockResponse(mockDataBlog)).toThrowError(
      'No request to respond to!'
    );
  });

  it('should catch error from fetch() called', async () => {
    const content = mockContent();
    const $content = content.$content;
    let catchErr: any = null;
    const res = $content('blog')
      .sortBy('id')
      .fetch()
      .catch((err: any) => {
        catchErr = err;
      });
    content.mockError({ statusCode: 404, message: 'Page not found' });
    await res;
    expect(catchErr).toEqual({ statusCode: 404, message: 'Page not found' });
  });

  it('should throw error at call a method that does not exist', async () => {
    const content = mockContent();
    const $content = content.$content;
    expect(() =>
      $content('blog').only('tag').distinct('tag').fetch()
    ).toThrowError(/distinct/);
  });

  it('should throw error at not found a mock in chain', async () => {
    const content = mockContent();
    const $content = content.$content;
    $content('blog').only('tag').sortBy('tag').fetch();
    const chain = await content.mockResponse([{ tag: 'nuxt' }]);
    expect(() => chain.find('limit')).toThrowError(/limit/);
  });
});
