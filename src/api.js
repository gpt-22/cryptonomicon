const apiKey = process.env.VUE_APP_API_KEY
const socket = new WebSocket(`wss://streamer.cryptocompare.com/v2?api_key=${apiKey}`)

socket.addEventListener('message', e => {
  const {TYPE: type, FROMSYMBOL: ticker, PRICE: newPrice} = JSON.parse(e.data)

  if (type !== TICKER || newPrice === undefined) return
  const tickerHandler = tickersHandlersMap.get(ticker)
  tickerHandler(newPrice)

  pricesChannel.postMessage({ticker: ticker, price: newPrice})
})

const pricesChannel = new BroadcastChannel('pricesChannel')

pricesChannel.onmessage = (msg) => {
  const tickerHandler = tickersHandlersMap.get(msg.data.ticker)
  tickerHandler(msg.data.price)
}

const tickersHandlersMap = new Map()
const TICKER = '2'

export const loadCoins = async () => {
  return fetch('https://min-api.cryptocompare.com/data/all/coinlist?summary=true')
      .then(response => response.json())
      .then(data => data.Data)
}

const sendToWebSocket = (message) => {
  const stringifiedMessage = JSON.stringify(message)

  if (socket.readyState === WebSocket.OPEN) {
    socket.send(stringifiedMessage)
    return
  }

  socket.addEventListener(
    'open',
    () => socket.send(stringifiedMessage),
    {
      once: true
    }
  )
}

const subscribeToTickerOnWS = (ticker) => {
  sendToWebSocket({
    'action': 'SubAdd',
    'subs': [`2~Binance~${ticker}~USDT`]
  })
}

const unsubscribeFromTickerOnWS = (ticker) => {
  sendToWebSocket({
    'action': 'SubRemove',
    'subs': [`2~Binance~${ticker}~USDT`]
  })
}

export const subscribeToTickerUpdates = (ticker, callback) => {
  tickersHandlersMap.set(ticker, callback)
  subscribeToTickerOnWS(ticker)
}

export const unsubscribeFromTickerUpdates = (ticker) => {
  tickersHandlersMap.delete(ticker)
  unsubscribeFromTickerOnWS(ticker)
}

/* TODO:
* 1. do not subscribe via websockets when in new tab
* 2. rewrite unsubscribeFromTickerUpdates to unsub from particular callback func
* */
