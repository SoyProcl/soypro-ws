import redis from 'redis'
import * as Sentry from '@sentry/node'

const redisClient = redis.createClient(
  'redis://redistogo:7a11307cee7f9c4c44a2948f3b7bb783@pike.redistogo.com:9644/'
)

export const connect = cb => {
  redisClient.on('connect', function() {
    cb('Conectado a Redis Server')
  })
}

export const fromCache = async key => {
  return new Promise(resolve => {
    try {
      redisClient.get(key, (err, value) => {
        if (err) {
          resolve(null)
        } else {
          resolve(JSON.parse(value))
        }
      })
    } catch (error) {
      resolve(null)
    }
  })
}

export const setCache = async (key, value = {}, expiration = 3600) => {
  try {
    redisClient.setex(key, expiration, JSON.stringify(value))
    return Promise.resolve('OK')
  } catch (error) {
    Sentry.captureException(error)
    return Promise.reject(error)
  }
}
