import Weather from '@tinoschroeter/weather-js'
import ollama from 'ollama'

const weather = new Weather()

const functions = {
    async current({ city }) {
        try {
            const [{ current }] = await weather.find({ search: city, degreeType: "F" })
            return { current }
        } catch (e) {
            console.error(e)
            throw new Error(`Could not get the current weather for ${city}.`)
        }
    },
    async forecast({ city }) {
        try {
            const [{ forecast }] = await weather.find({ search: city, degreeType: "F" })
            return { forecast }
        } catch (e) {
            console.error(e)
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
            console.error(e.message, name, argsj)
            return { error: 'Could not call function.' }
        }
    }
}

const p = process.argv.slice(2).join(' ')
console.log(`>> ${p}\n`)

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
        messages,
    })
    console.log(`> ${ai1.message.content}\n`)
    console.log(`] ${JSON.stringify(r1)}\n`)
    console.log(ai2.message.content)
} else {
    console.log(ai1.message.content)
}