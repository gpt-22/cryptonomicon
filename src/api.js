const apiKey = process.env.VUE_APP_API_KEY
const socket = new WebSocket(`wss://streamer.cryptocompare.com/v2?api_key=${apiKey}`)
const tickersHandlers = new Map()
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

  socket.addEventListener('open', () => {
    socket.send(stringifiedMessage)
  }, {once: true})
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
  const subscribers = tickersHandlers.get(ticker) || []
  tickersHandlers.set(ticker, [...subscribers, callback])
  subscribeToTickerOnWS(ticker)
}

export const unsubscribeFromTickerUpdates = (ticker) => {
  tickersHandlers.delete(ticker)
  unsubscribeFromTickerOnWS(ticker)
}

socket.addEventListener('message', e => {
  const {TYPE: type, FROMSYMBOL: ticker, PRICE: newPrice} = JSON.parse(e.data)

  if (type !== TICKER) return

  const handlers = tickersHandlers.get(ticker ?? [])
  handlers.forEach(fn => fn(newPrice))
})
