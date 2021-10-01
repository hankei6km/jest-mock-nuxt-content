# jest-mock-nuxt-content

[jest](https://jestjs.io/) 用 [nuxt-content](https://content.nuxtjs.org/) の mock。

jest-mock-nuxt-content は [jest-mock-axios](https://www.npmjs.com/package/jest-mock-axios) を参考にしています。


## Install

```
$ npm install --save-dev @hankei6km/jest-mock-nuxt-content
```

or

```
$ yarn add --dev @hankei6km/jest-mock-nuxt-content
```

## Usage

基本的な流れ。

- `asyncData` 内で `fetch()` が実行される(モックデータ待ちになる)
- `$content` を検証する
- `context.mockResponse` でモックデータを渡し、[メソッド](https://content.nuxtjs.org/fetching) のチェインリスト(モックメソッドの実行履歴)を受け取る
- チェインリストを検証する
- 最終的に `asyncData` の戻り値を検証する


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

import Vue from 'vue'
import { shallowMount } from '@vue/test-utils'
import { mockContent } from '@hankei6km/jest-mock-nuxt-content'
import indexPage from '~/pages/index.vue'

describe('IndexPage', () => {
  it('should calls $content.fetch() method in asyncData', async () => {
    const content = mockContent()
    const $content = content.$content
    const mockDataArticle = { title: 'home' }
    const mockDataImages = [
      // snip..
    ]

    const vm = new Vue(indexPage)
    if (vm.$options.asyncData) {
      const data = vm.$options.asyncData({ $content, params: {} } as any)

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
      // 注意: これは [Nuxt のライフサイクル](https://nuxtjs.org/docs/concepts/nuxt-lifecycle) とは異なる挙動です。
      const mockData = await data
      const wrapper = shallowMount(indexPage, {
        data() {
          return mockData
        },
        stubs: {
          ToGallery: true,
          NuxtContent: true,
          NuxtImg: true,
          ImageTiles: true,
        },
      })

      // snip..
    }
  })
})

```

## API


### `mockContent()`

`content` インスタンスの生成。

### `content.$content`

コンテキストへ挿入するモックのエントリーポイント。

### `content.mockResponse(res)`

- 結果を待っている `fetch` へ返信データを渡す
- `fetch()` 実行時のチェインリストを返す

#### `res`

`fetch` へ渡す返信データ。

#### returns

`Promise<ChainList>`

### `content.mockError(reason)`

- 結果を待っている `fetch` を reject する
- `fetch()` 実行時のチェインリストを返す

#### `reason`

reject する理由。

#### returns

`Promise<ChainList>`

### `ChainList.count()`

実行されたメソッドの個数。

#### returns

`number`

### `ChainList.at(idx)`

指定位置のモックメソッドを返す。

### `idx`

モックメソッドの位置。

### returns

`jest.Mock<any, any>`


### `ChainList.find(name)`

見つかった最初のモックメソッドを返す。
メソッドが見つからないときはエラーを throw する。

### `name`

モックメソッドの名前。

### returns

`jest.Mock<any, any>`


### `ChainList.findAll(name)`

見つかったすべてのモックメソッドを返す。
メソッドが見つからないときは空の配列を返す。

### `name`

モックメソッドの名前。

### returns

`jest.Mock<any ,any>[]`


## ライセンス

MIT License

Copyright (c) 2021 hankei6km

