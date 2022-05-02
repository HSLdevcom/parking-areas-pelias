# Park and ride location import pipeline

A tool for importing park and ride locations for cars and bikes from OpenTripPlanner api into Pelias.

## Install dependencies

```bash
npm install
```

## Usage

Run the data import using the given OTP data source url, target and source. Valid targets are `bikePark` and `carPark`.

### Format:
`node import.js [url] [target] [source]`

### Example: 
`node import.js https://dev-api.digitransit.fi/routing/v1/routers/hsl/index/graphql bikePark liipi`
