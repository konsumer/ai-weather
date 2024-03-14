import Weather from '@tinoschroeter/weather-js'
import ollama from 'ollama'
import colorize from 'json-colorizer'
import chalk from 'chalk'
import { format } from 'date-fns'

const weather = new Weather()

const { DEBUG = false } = process.env

const model = 'konsumer/weather'

const getCityFromIP = () => fetch('https://vpncheck.vercel.app/geo').then(r => r.json()).then(d => `${d.city}, ${d.country === 'US' ? d.region : d.country}`)

const functions = {
  async current({ city }) {
    try {
      const [{ current }] = await weather.find({ search: city, degreeType: 'F' })

      // cleanup junk-fields
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
  },
  
  async forecast_for_date({city, date}) {
    const { forecast } = await functions.forecast({city})
    const dayForecast = forecast.find(f => f.date === date)
    if (!dayForecast) {
      throw new Error(`Could not get the weather forecast for ${city} on ${date}.`)
    }
    return { forecast: dayForecast }
  }
}

// this is used to find function-calls in AI-response
const rFunc = /<functioncall> {"name": "(.+)", "arguments": '(.+)'}/gm

async function processAnswer(answer) {
  if (answer.startsWith('<functioncall> ')) {
    try {
      rFunc.lastIndex = 0
      const r = rFunc.exec(answer)
      if (!r || !r[1]) {
        return { error: 'Could not parse function-call.' }
      }
      const res = await functions[r[1]](JSON.parse(r[2] || '{}'))
      return res
    } catch (e) {
      if (DEBUG) {
        console.error(e.message)
      }
      return { error: 'Could not call function.' }
    }
  }
}

const p = process.argv.slice(2).join(' ')

const messages = [{ role: 'user', content: `Right now, it's ${format(new Date(), "eeee, yyyy-MM-dd")}. I am in ${await getCityFromIP()}. ${p}` }]

const ai1 = await ollama.chat({
  model,
  messages
})

messages.push(ai1.message)
const r1 = await processAnswer(ai1.message.content)

if (r1) {
  messages.push({ role: 'user', content: `Function Response: ${JSON.stringify(r1)}` })

  const ai2 = await ollama.chat({
    model,
    messages
  })
  messages.push(ai2.message)
  if (!DEBUG) {
    // print the LLM's response to our function-response
    console.log(ai2.message.content)
  }
} else {
  // no function was called, so just print the LLM's response
  console.log(ai1.message.content)
}

// show the full conversation-flow
if (DEBUG) {
  console.log(
    messages
      .map(({ role, content }) => {
        let message = content
        let user = chalk.green(role)
        if (role === 'user') {
          user = chalk.cyan(role)
          try {
            message = 'RESPONSE ' + colorize(JSON.stringify(JSON.parse(content?.split('Function Response: ').pop()), null, 2))
          } catch (e) {}
        } else {
          try {
            rFunc.lastIndex = 0
            const [_, name, args] = rFunc.exec(content)
            if (name && args) {
              message = `FUNCTION ${chalk.bold(name)}(${colorize(args)})`
            }
          } catch (e) {}
        }
        return `${user}: ${message}`
      })
      .join('\n\n')
  )
}
