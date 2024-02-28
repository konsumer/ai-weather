import Weather from '@tinoschroeter/weather-js'
import ollama from 'ollama'
import colorize from 'json-colorizer'
import chalk from 'chalk'

const weather = new Weather()

const { DEBUG = false } = process.env

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
  }
}

// this is used to find function-calls in AI-response
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
messages.push({ role: 'user', content: JSON.stringify(r1) })

if (r1) {
  const ai2 = await ollama.chat({
    model: 'konsumer/weather',
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
            message = colorize(JSON.stringify(JSON.parse(content), null, 2))
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
