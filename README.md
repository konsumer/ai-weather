This is a simple example of calling functions on an LLM.

![screenshot](screen.png)

## what can it do?

It can get current weather & forecast. Here are some example questions it will try to answer with real weather-data:

```
Is it raining?
What will the weather be like this week, in Seattle, WA?
Is it raining in Portland, OR?
What will the weather be on Wednesday, in New York City?
How hot is it likely to be, next Friday, in Tampa, FL?
```

## hallucination

It makes up answers sometimes. Generally, the trick is improving the prompt, and writing better function-descriptions.

For example, there used to not be a `forecast_for_day` and it would not say "Right now, it's Tuesday, 2024-02-27." With these, it's more likely to answer "How hot is it likely to be, next Friday, in Tampa, FL?" correctly, but it still messes up. About 1/3 of the time, it will decide the date should be Saturday, or pull the wrong day from `forecast`, or other similar problems.

## things you can do

- Check out [the code](server.js) that wraps the return-value (pulling out function-calls.)
- Check out [the ollama Modelfile](weather.Modelfile) that tells the LLM about th functions.
- You can chat directly with this model with `ollama run konsumer/weather`, but you will need to provide your own function-answers.

```
# setup dependencies
npm i

# You can build the ollama model, locally (not needed)
npm run weather:build

# test with Portland
npm test

# test with any question
npm run weather "what do you liek to do for fun?"

# I enjoy helping users get information about the weather. It's a pleasure to be of assistance!
```
