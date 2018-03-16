
# HTTP Server Running Arbitrary Code

This is an HTTP server (express.js) which executes POST-ed code,
in various languages.

## Installation
```bash
yarn
```
You can of course use `npm` (`npm i`)

## Usage
### Development server
```bash
yarn start
# The project is available at http://localhost:3000
```
This starts a `gulp` development server which _hot-reloads the code_ :rocket:

You can add `--verbose` to make the server print what it does.

The server ([`src/main.js`](./src/main.js)) is an express instance.

### Making requests
Requests are made via `POST` to `/python` or `/ruby`.

The request body must be plain test. The result is also plain text, a stringified JSON.

The returned result is whatever was printed, each separate line generating an element in an array.

For example, calling the development server end-point http://localhost:3000/python
with this request body:
```
x = 1
while x < 5:
    print(x)
    x = x + 1
```
will produce this response body :
`'["1","2","3","4"]'`


For more details, see the [tests](./tests/rest.spec.js)

## Tests
`yarn test` or `yarn test:watch`

To see the output, set environment variable `VERBOSE`, i.e. `VERBOSE=true yarn test`

## Security constraints

:house: A new container is created for each call run, so the code runs in an _isolated environment_

:hourglass_flowing_sand: The code execution is `time-boxed` to prevent infinite loops.
Currently, after 5 seconds an error (http code `400`) is returned.

:bomb: There's no limit to the memory allocated to the containers (vulnerable to fork bombs, for example).
_However, restrictions can set on the Docker server itself!_

:vertical_traffic_light: There's a limited number of tasks executed concurrently (_5_ tasks).
Once this number has been reached, a `TaskManager` will start queueing them.

## Extending with new languages
Currently there's support for _Ruby_ and _Python_, but extending should be
as easy as adding docker images and using them as in
[PythonContainer.js](./src/containers/PythonContainer.js)
and plugging them in the express server in [routes.js](./src/routes.js)