# RS-API

Fetches Rigas Satiksme stop/route data and transforms it into saner structure.

### /stops

Returns JSON array consisting of elements:

```
{
    rsId: String
    lat: Float
    lng: Float
    name: String
}
```

### /routes

Returns JSON array consisting of elements:

```
{
    kind: String // bus, tram, etc
    name: String // ex "First stop - last stop"
    number: String
    direction: String // ex "a-b" or "b-a"
    runs: [
        {
            weekdays: String // ex "67" for weekend-only run
            times: { String: Int } // Key: rsId of a stop, value: minutes past midnight
        }
    ]
}
```

[kind, direction, number] is unique.
