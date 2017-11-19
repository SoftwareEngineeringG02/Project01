# Server

## Installation
You can install the server by running the following command:

```
 $ curl "https://raw.githubusercontent.com/SoftwareEngineeringG02/Project01/master/server/install.sh" | /bin/bash
```

This will set up the environment with the correct version of Node and install the server's dependencies.

## Documentation
### JSDoc

Automatically generated code documentation can be found in the doc/ directory.

### API

The server uses a HATEOAS-like API with data transferred in JSON format.

#### Endpoints

The endpoints currently defined are:

rel             | href               | methods | Effect
--------------- | ------------------ | --------| --
`index`         | `/`                | `GET`   | Get a list of available endpoints
`get-location`  | `/location`        | `POST`  | Get the most recent location of the client if any
`set-location`  | `/location/update` | `POST`  | Update the client's location
`list-location` | `/location/list`   | `POST`  | Get all the locations the client has sent
`get-price`     | `/price`           | `POST`  | Get the price data for a location
`get-price-map` | `/price/map`       | `POST`  | Get all the prices within a radius.

 * Each endpoint responds only to the method listed in the table.
 * The reason for the `rel` column will become clear in the `Responses` section.

#### Requests

 * POST requests should contain a JSON object in the body with the following fields:

```
{
    id:        A string which uniquely identifies the client, such as a phone number
    time:      A 32-bit UNIX timestamp (i.e. integer seconds elapsed since 1 January 1970) of the time the request is sent
    longitude: A double-precision floating point number (set-location, list-location, get-price, get-price-map)
    latitude:  A double-precision floating point number (set-location, list-location, get-price, get-price-map)
    radius:    A number defining the radius of the map in meters (get-price-map only)
}
```

#### Responses

Every response from the server will include a JSON object the following properties:

```
{
    error:     0 (success) or 1 (failure),
    message:   an error or other relevant message,
    longitude: double precision float (get-location)
    latitude:  double precision float (get-location)
    price:     price paid for house in GBP (get-price)
    map:       array of longitude, latitude and price data within radius (get-price-map)
    links:     an array of objects which describe the endpoints available. For example:
               [{ rel:    the name of the endpoint,
                  href:   the url of the endpoint,
                  method: the HTTP method
               }]
}
```

 * Before making any other requests, clients should make a `GET` request to `/` which will return the above JSON object. Clients should then get the URL of the endpoint they want to use from the `links` array rather than hardcoding it. This allows the endpoint paths to be changed without breaking client code.

 * Clients should always check the value of the `error` field and report any errors to the user.

 * When using the `get-location` endpoint, the response will include `longitude` and `latitude` properties, which are double-precision floating point numbers defining the longitude and its latitude respectively.

* When using the `list-location` endpoint, the response will include an array of Javascript objects with `longitude`, `latitude` and `time` properties.

* `get-price` returns a property called `price` which is the price paid for the property in pounds. `get-price-map` returns a property called `map` which associates longitude and latitudes with prices paid within a radius of the supplied `longitude` and `latitude`. This also returns post codes and addresses where available.
