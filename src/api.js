const apiKey = process.env.VUE_APP_API_KEY
const tickersHandlers = new Map()

export const loadCoins = async () => {
  return fetch('https://min-api.cryptocompare.com/data/all/coinlist?summary=true')
      .then(response => response.json())
      .then(data => data.Data)
}

// TODO: refactor to use URLSearchParams
export const loadTickerPrices = () => {
  if (!tickersHandlers.size) return

  const fsyms = [...tickersHandlers.keys()].join(',')
  fetch(`https://min-api.cryptocompare.com/data/pricemulti?fsyms=${fsyms}&tsyms=USD&api_key=${apiKey}`)
    .then(r => r.json())
    .then(rawData => {
      const updatedPrices = Object.fromEntries(
        Object.entries(rawData).map(([key, value]) => [key, value.USD])
      )

      Object.entries(updatedPrices).forEach(([ticker, newPrice]) => {
        const handlers = tickersHandlers.get(ticker) ?? []
        handlers.forEach(fn => fn(newPrice))
      })

      return updatedPrices
    })
}

export const subscribeToTickerUpdates = (ticker, callback) => {
  const subscribers = tickersHandlers.get(ticker) || []
  tickersHandlers.set(ticker, [...subscribers, callback])
}

export const unsubscribeFromTickerUpdates = (ticker) => {
  tickersHandlers.delete(ticker)
}

setInterval(loadTickerPrices, 1000)
