This is a simple example of calling functions on an LLM.

```
# setup dependencies
npm i

# I cannot currently publish my ollama test model, so you have to build it locally (requires ollama CLI installed, in your path)
npm run weather:build

# test with Portland
npm test

# test with any question
node server "What is your purpose, and also whayt sort of weather do you like?"

# My purpose is to provide information about the current and forecasted weather for any city. As for my personal preferences, I am a big fan of sunny days with moderate temperatures
```
