# jest-mock-nuxt-content

[nuxt-content](https://content.nuxtjs.org/) mock for [jest](https://jestjs.io/),

jest-mock-nuxt-content is inspired by [jest-mock-axios](https://www.npmjs.com/package/jest-mock-axios).

## Install

```
$ npm install --save-dev @hankei6km/jest-mock-nuxt-content
```

or

```
$ yarn add --dev @hankei6km/jest-mock-nuxt-content
```

## Usage

Basic flow.

- call `asyncData` with injecting mock(`$content`)
- `fetch()` has been called in`asyncData`(waiting mock data)
- ensure `$content` has been called with content path etc.
- pass mock data via `context.mockResponse()` to waiting `fetch()` and receive chain list of [methods](https://content.nuxtjs.org/fetching)(history to chain sequence)
- ensure chain list
- fimaly, verify a return value from `asyncData()`

```typescript
// pages/index.vue

export default Vue.extend({
  async asyncData({ $content, params }) {
    const article = await $content('pages/home').fetch()
    const images = await $content('gallery').sortBy('position').fetch()
    return { article, images }
  },
  // snip...

})
```

```typescript
// test/pages/index.ts

import { shallowMount } from '@vue/test-utils'
import { mockContent } from '@hankei6km/jest-mock-nuxt-content'
import indexPage from '~/pages/index.vue'

describe('IndexPage', () => {
  it('should calls $content.fetch() method in asyncData', async () => {
    const content = mockContent()
    const $content = content.$content
    const mockDataArticle = { title: 'home' }
    const mockDataImages = [
        // snip...
    ]

    const wrapperAsyncData = shallowMount(indexPage, {
        // snip...
    })
    if (wrapperAsyncData.vm.$options.asyncData) {
      // Note: this flow diffrent from [Nuxt lifecycle](https://nuxtjs.org/docs/concepts/nuxt-lifecycle).
      const data = wrapperAsyncData.vm.$options.asyncData({
        $content,
        params: {},
      } as any)

      // ensure frist fetch() called
      expect($content).toHaveBeenLastCalledWith('pages/home')
      await content.mockResponse(mockDataArticle)

      // ensure second fetch() called
      expect($content).toHaveBeenLastCalledWith('gallery')
      const imagesChain = await content.mockResponse(mockDataImages)
      expect(imagesChain.at(0).getMockName()).toEqual('sortBy')
      expect(imagesChain.at(0)).toHaveBeenCalledWith('position')

      // verify a return value from asyncData()
      expect(await data).toEqual({
        article: mockDataArticle,
        images: mockDataImages,
      })

      // render actual page by using mock data from asyncData()
      // Note: this flow diffrent from [Nuxt lifecycle](https://nuxtjs.org/docs/concepts/nuxt-lifecycle).
      const mockData = await data
      const wrapper = shallowMount(indexPage, {
        data() {
          return mockData
        },
        // snip...
      })

      // snip..
    }
  })
})
```

## API


### `mockContent()`

return instance of `content`.

### `content.$content`

entry point of mocked methods for inject into the context.

### `content.mockResponse(res)`

- pass mock data to `fetch()` that is waiting response data
- return the chain list made when `fetch()` has been called

#### `res`

mock data to `fetch()`.

#### returns

`Promise<ChainList>`

### `content.mockError(reason)`

- recject `fetch()` that is waiting response data 
- return the chain list made when `fetch()` has been called

#### `reason`

reason to reject.

#### returns

`Promise<ChainList>`

### `ChainList.count()`

count of called mocked methods.

#### returns

`number`

### `ChainList.at(idx)`

return mocked method at passed index.

### `idx`

index of mocked method.

### returns

`jest.Mock<any, any>`


### `ChainList.find(name)`

return the first mocked method found.
error thrown if mocked method could not be found.

### `name`

name of mocked method.

### returns

`jest.Mock<any, any>`


### `ChainList.findAll(name)`

return all mocked methods found.
return empty array if mocked method could not be found.

### `name`

name of mocked method.

### returns

`jest.Mock<any ,any>[]`


## License

MIT License

Copyright (c) 2021 hankei6km

