import Weather from '@tinoschroeter/weather-js'
import ollama from 'ollama'

const weather = new Weather()

const { DEBUG = false } = process.env

const functions = {
  async current({ city }) {
    try {
      const [{ current }] = await weather.find({ search: city, degreeType: 'F' })
      delete current.day
      delete current.shortday
      delete current.imageUrl
      return { current }
    } catch (e) {
      if (DEBUG) {
        console.error(e)
      }
      throw new Error(`Could not get the current weather for ${city}.`)
    }
  },
  async forecast({ city }) {
    try {
      const [{ forecast }] = await weather.find({ search: city, degreeType: 'F' })
      return { forecast }
    } catch (e) {
      if (DEBUG) {
        console.error(e)
      }
      throw new Error(`Could not get the forecasted weather for ${city}.`)
    }
  }
}

const rFunc = /<functioncall> {"name": "([a-zA-Z]+)", "arguments": '(.+)'}/gm

async function processAnswer(answer) {
  if (answer.startsWith('<functioncall> ')) {
    try {
      const [_, name, argsj] = rFunc.exec(answer)
      if (!name) {
        return { error: 'Could not parse function-call.' }
      }
      const res = await functions[name](JSON.parse(argsj))
      return { [name]: { status: 'success', ...res } }
    } catch (e) {
      if (DEBUG) {
        console.error(e.message, name, argsj)
      }
      return { error: 'Could not call function.' }
    }
  }
}

const p = process.argv.slice(2).join(' ')

const messages = [{ role: 'user', content: p }]

const ai1 = await ollama.chat({
  model: 'konsumer/weather',
  messages
})

messages.push(ai1.message)
const r1 = await processAnswer(ai1.message.content)

if (r1) {
  messages.push({ role: 'user', content: JSON.stringify(r1) })
  const ai2 = await ollama.chat({
    model: 'konsumer/weather',
    messages
  })
  messages.push(ai2.message)
  if (!DEBUG) {
    console.log(ai2.message.content)
  }
}

if (DEBUG) {
  console.log(messages)
}
