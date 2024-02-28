This is a simple example of calling functions on an LLM.

![screenshot](screen.png)

It can get current weather & forecast. Here are some examples:

```
What will the weather be like this week, in Seattle, WA?
Is it raining in Portland, OR?
What will the weather be on Wednesday, in New York City?
How hot is it likely to be, next Friday, in Tampa, FL?
```

It hallucinates sometimes, like the last question gave me this:

```
It will likely be 78 degrees on Friday, February 27th in Tampa, FL. The day will start out partly sunny and get warmer as the day goes on. There's a chance of precipitation throughout the week
```

Which has the wrong date & forecast:

```json
[
  {
    "low": "59",
    "high": "78",
    "skycodeday": "30",
    "skytextday": "Partly Sunny",
    "date": "2024-02-27",
    "day": "Tuesday",
    "shortday": "Tue",
    "precip": "1"
  },
  {
    "low": "60",
    "high": "79",
    "skycodeday": "34",
    "skytextday": "Mostly Sunny",
    "date": "2024-02-28",
    "day": "Wednesday",
    "shortday": "Wed",
    "precip": "1"
  },
  {
    "low": "61",
    "high": "75",
    "skycodeday": "30",
    "skytextday": "Partly Sunny",
    "date": "2024-02-29",
    "day": "Thursday",
    "shortday": "Thu",
    "precip": "22"
  },
  {
    "low": "63",
    "high": "80",
    "skycodeday": "30",
    "skytextday": "Partly Sunny",
    "date": "2024-03-01",
    "day": "Friday",
    "shortday": "Fri",
    "precip": "5"
  },
  {
    "low": "63",
    "high": "76",
    "skycodeday": "28",
    "skytextday": "Mostly Cloudy",
    "date": "2024-03-02",
    "day": "Saturday",
    "shortday": "Sat",
    "precip": "26"
  }
]
```

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
