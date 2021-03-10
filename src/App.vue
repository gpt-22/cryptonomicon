<template>
  <div class="container mx-auto flex flex-col items-center bg-gray-100 p-4">
    <!-- loader -->
    <div v-if="coins.length === 0" class="fixed w-100 h-100 opacity-80 bg-purple-800 inset-0 z-50 flex items-center justify-center">
      <svg class="animate-spin -ml-1 mr-3 h-12 w-12 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>
    <!-- /loader -->

    <div class="container">
      <!-- form -->
      <section>
        <div class="flex">
          <div class="max-w-xs">
            <label for="ticker" class="block text-sm font-medium text-gray-700">
              Тикер
            </label>
            <div class="mt-1 relative rounded-md shadow-md">
              <input
                  v-model="coinName"
                  @input="filterHints"
                  @keypress.enter="addCoin"
                  type="text"
                  name="ticker"
                  id="ticker"
                  autocomplete="off"
                  class="block w-full pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
                  placeholder="Например, DOGE"
              />
            </div>
            <div v-if="hints.length" class="flex bg-white shadow-md p-1 rounded-md shadow-md flex-wrap">
              <span
                  v-for="hint in hints"
                  :key="hint"
                  @click="hintClickHandler(hint)"
                  class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer">
                {{ hint }}
              </span>
            </div>
            <div v-show="isCoinAdded()" class="text-sm text-red-600">Такой тикер уже добавлен</div>
          </div>
          <button
              @click="addCoin"
              type="button"
              class="my-6 mx-4 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            <svg
                class="-ml-0.5 mr-2 h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                width="30"
                height="30"
                viewBox="0 0 24 24"
                fill="#ffffff"
            >
              <path d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7zm-1-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"></path>
            </svg>
            Добавить
          </button>
        </div>
      </section>
      <!-- /form -->


      <template v-if="addedCoins.length">
        <!-- filter -->
        <hr class="w-full border-t border-gray-600 my-4" />
        <div class="flex">
          <div class="max-w-xs">
            <label for="filter" class="block text-sm font-medium text-gray-700">
              Фильтр
            </label>
            <div class="mt-1 relative rounded-md shadow-md">
              <input
                  v-model="filter"
                  type="text"
                  name="filter"
                  id="filter"
                  class="block pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
                  placeholder="Например, DOGE"
              >
            </div>
          </div>
          <div class="mx-4 mt-2">
            <button
                @click="page--"
                :disabled="page < 2"
                class="mx-1 my-4 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
            >
              Назад
            </button>
            <button
                @click="page++"
                :disabled="!this.hasNextPage"
                class="mx-1 my-4 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
            >
              Вперёд
            </button>
          </div>
        </div>
        <!-- /filter -->

        <!-- coins-cards -->
        <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div
              v-for="coin in paginatedCoins"
              @click="select(coin)"
              :key="coin.Id"
              :class="isActive(coin) ? 'border-4' : ''"
              class="bg-white overflow-hidden shadow rounded-lg border-purple-800 border-solid cursor-pointer"
          >
            <div class="px-4 py-5 sm:p-6 text-center">
              <dt class="text-sm font-medium text-gray-500 truncate">
                {{ coin.Symbol }} - USD
              </dt>
              <dd class="mt-1 text-3xl font-semibold text-gray-900">
                {{ formatPrice(coin.price) }}
              </dd>
            </div>
            <div class="w-full border-t border-gray-200"></div>
            <button
                @click.stop="deleteCoin(coin)"
                class="flex items-center justify-center font-medium w-full bg-gray-100 px-4 py-4 sm:px-6 text-md text-gray-500 hover:text-gray-600 hover:bg-gray-200 hover:opacity-20 transition-all focus:outline-none"
            >
              <svg
                  class="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="#718096"
                  aria-hidden="true"
              >
                <path
                    fill-rule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clip-rule="evenodd"
                ></path>
              </svg>
              Удалить
            </button>
          </div>
        </dl>
        <hr class="w-full border-t border-gray-600 my-4" />
        <!-- /coins-cards -->
      </template>

      <!-- graph -->
      <section v-if="selectedCoin" class="relative">
        <h3 class="text-lg leading-6 font-medium text-gray-900 my-8">
          {{ selectedCoin.Symbol }} - USD
        </h3>
        <div class="flex items-end border-gray-600 border-b border-l h-64 overflow-hidden">
          <div
              v-for="(bar,idx) in normalizedGraph"
              :key="idx"
              :style="{ height: `${bar}%`}"
              class="bg-purple-800 border w-1">

          </div>
        </div>
        <button
            @click="selectedCoin = null"
            type="button"
            class="absolute top-0 right-0"
        >
          <svg
              xmlns="http://www.w3.org/2000/svg"
              version="1.1"
              width="30"
              height="30"
              x="0"
              y="0"
              viewBox="0 0 511.76 511.76"
              style="enable-background:new 0 0 512 512"
              xml:space="preserve"
          >
            <g>
              <path
                  d="M436.896,74.869c-99.84-99.819-262.208-99.819-362.048,0c-99.797,99.819-99.797,262.229,0,362.048    c49.92,49.899,115.477,74.837,181.035,74.837s131.093-24.939,181.013-74.837C536.715,337.099,536.715,174.688,436.896,74.869z     M361.461,331.317c8.341,8.341,8.341,21.824,0,30.165c-4.16,4.16-9.621,6.251-15.083,6.251c-5.461,0-10.923-2.091-15.083-6.251    l-75.413-75.435l-75.392,75.413c-4.181,4.16-9.643,6.251-15.083,6.251c-5.461,0-10.923-2.091-15.083-6.251    c-8.341-8.341-8.341-21.845,0-30.165l75.392-75.413l-75.413-75.413c-8.341-8.341-8.341-21.845,0-30.165    c8.32-8.341,21.824-8.341,30.165,0l75.413,75.413l75.413-75.413c8.341-8.341,21.824-8.341,30.165,0    c8.341,8.32,8.341,21.824,0,30.165l-75.413,75.413L361.461,331.317z"
                  fill="#718096"
                  data-original="#000000"
              ></path>
            </g>
          </svg>
        </button>
      </section>
      <!-- /graph -->

    </div>

  </div>
</template>

<script>
import {loadCoins, subscribeToTickerUpdates, unsubscribeFromTickerUpdates} from '@/api'

export default {
  name: 'App',

  data() {
    return {
      coins: [],
      addedCoins: [],
      hints: ['BTC', 'ETH', 'BCH', 'DOGE'],
      graph: [],
      coinName: '',
      filter: '',
      selectedCoin: null,
      page: 1,
      lastPage: 1,
      hasNextPage: false
    }
  },

  created() {
    const windowData = Object.fromEntries(new URL(window.location).searchParams.entries())
    if (windowData.filter) this.filter = windowData.filter
    if (windowData.page) this.page = +windowData.page

    const savedCoinsData = JSON.parse(localStorage.getItem('cryptonomicon-added-coins'))
    if (savedCoinsData) {
      this.addedCoins = savedCoinsData
      this.addedCoins.forEach(coin => {
        subscribeToTickerUpdates(coin.Symbol, (newPrice) => {
          this.updateCoinPrice(coin.Symbol, newPrice)
        })
      })
    }

    loadCoins().then(coins => this.coins = coins)
  },

  computed: {
    startPageIndex() {
      return 6 * (this.page - 1)
    },

    endPageIndex() {
      return 6 * this.page
    },

    filteredCoins() {
      if (this.filter.length) {
        const filteredTickers = this.getSortedTickersByName(this.filter, this.addedCoins)
        return filteredTickers.map(ticker => {
          return this.addedCoins.find(coin => coin.Symbol === ticker)
        })
      } else {
        return this.addedCoins
      }
    },

    paginatedCoins() {
      if (this.filteredCoins.length) {
        return this.filteredCoins.slice(this.startPageIndex, this.endPageIndex)
      } else if (this.filter.length) {
        return []
      } else return this.addedCoins.slice(this.startPageIndex, this.endPageIndex)
    },

    normalizedGraph() {
      const maxValue = Math.max(...this.graph)
      const minValue = Math.min(...this.graph)
      if (maxValue === minValue) {
        return this.graph.map(() => 50)
      }
      return this.graph.map(
          price => 5 + ((price - minValue) * 95) / (maxValue - minValue)
      )
    },

    pageStateOptions() {
      return {
        filter: this.filter,
        page: this.page,
        lastPage: this.lastPage
      }
    }
  },

  watch: {
    addedCoins(newValue, oldValue) {
      localStorage.setItem('cryptonomicon-added-coins', JSON.stringify(this.addedCoins))

      if (newValue.length > this.lastPage*6) {
        this.lastPage++
      } else if ((this.lastPage > 1) && (newValue.length === (this.lastPage - 1)*6)) {
        this.lastPage--
      }

      if (oldValue.length) this.page = this.lastPage
    },

    filteredCoins() {
      this.lastPage = Math.ceil(this.filteredCoins.length / 6)
    },

    filter() {
      this.page = 1
    },

    pageStateOptions(newState) {
      window.history.pushState(
          null,
          document.title,
          `${window.location.pathname}?filter=${newState.filter}&page=${newState.page}`
      )

      this.hasNextPage = newState.page !== newState.lastPage
    },

    selectedCoin() {
      this.graph = []
    }
  },

  methods: {
    formatPrice(price) {
      if (typeof price !== 'number') return '-'
      return price > 1 ? price.toFixed(2) : price.toPrecision(2)
    },

    hintClickHandler(hint) {
      this.coinName = hint
    },

    isCoinNameStartsWith(coin, name) {
      if (coin && name) {
        const capitalizedName = name[0].toUpperCase() + name.slice(1)
        const uppercaseName = name.toUpperCase()
        return coin.Symbol.startsWith(uppercaseName) || coin.FullName.startsWith(capitalizedName)
      }
    },

    getSortedTickersByName(name, coinsArray=this.coins) {
      const tickers = coinsArray instanceof Array
          ? this.addedCoins.map(coin => coin.Symbol)
          : Object.keys(coinsArray)
      return tickers.filter(ticker => {
        const coin = this.coins[ticker]
        return this.isCoinNameStartsWith(coin, name)
      }).sort()
    },

    searchCoin(name) {
      // search coin by ticker or full name in all coins array
      const ticker = this.getSortedTickersByName(name)[0]
      const coin = this.coins[ticker]
      return ticker ? coin : false
    },

    addCoin() {
      if (!this.coinName.length) return false
      const coin = this.searchCoin(this.coinName)
      if (!this.addedCoins.map(coin => coin.Symbol).includes(coin.Symbol)) {
        this.addedCoins = [...this.addedCoins, coin]
        subscribeToTickerUpdates(coin.Symbol, (newPrice) => {
          this.updateCoinPrice(coin.Symbol, newPrice)
        })
        this.coinName = ''
        this.hints = ['BTC', 'ETH', 'BCH', 'DOGE']
      }
    },

    deleteCoin(coinToDelete) {
      if (this.selectedCoin === coinToDelete) this.selectedCoin = null
      unsubscribeFromTickerUpdates(coinToDelete.Symbol)
      this.addedCoins = this.addedCoins.filter(coin => coin !== coinToDelete)
    },

    isCoinAdded() {
      if (!this.coinName.length) return false

      const coin = this.searchCoin(this.coinName)
      return coin ? this.addedCoins.map(coin => coin.Symbol).includes(coin.Symbol) : false
    },

    select(coin) {
      this.selectedCoin = coin
    },

    isActive(coin) {
      return this.selectedCoin === coin
    },

    filterHints() {
      if (!this.coinName.length) this.hints = []
      this.hints = this.getSortedTickersByName(this.coinName).slice(0, 4)
    },

    updateCoinPrice(ticker, price) {
      this.addedCoins
          .filter(coin => coin.Symbol === ticker)
          .forEach(coin => coin.price = price)
    }
  }
}

/* TODO:
1. наличие в состоянии зависимых данных, критичность: 6 +
2. API запросы напрямую внутри компонента -> нарушение single responsibility, критичность: 5 +
3. при тикера удалении остаётся подписка на загрузку данных о нём, критичность: 5
4. количество запросов, критичность: 4
5. обработка ошибок API, критичность: 5
6. обновить lastPage при закгрузке страницы, критичность: 5 +
7. localStorage и анонимные вкладки, критичность: 3
8. вид графика при множестве цен, критичность: 3
9. одинаковый код в watch, критичность: 2 +
10. magic numbers and strings, критичность: 1
---------------
1. При удалении всех coins страница должна быть 1, а не 0 +
2. При загрузке страницы пофиксить disabled у кнопок вперед и назад +
3. При добавлении тикера страница всегда переключается на последнюю +
4. При клике на график больше раза он сбрасывается +
 */

</script>

<style>

</style>
