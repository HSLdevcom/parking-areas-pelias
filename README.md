# Park and ride location import pipeline

A tool for importing park and ride locations for cars and bikes from OpenTripPlanner api into Pelias.

## Install dependencies

```bash
npm install
```

## Usage

Run the data import using the given OTP data source url, target and source.

### Format:
`node import.js [url] vehicleParking [source]`

### Example: 
`node import.js https://dev-api.digitransit.fi/routing/v2/routers/hsl/index/graphql vehicleParking liipi`
