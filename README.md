# Simple virtual machine for javascript

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

The server ([`src/main.js`](./src/main.js)) is an express instance.

### Making requests
Requests are made via `POST` to `/js` (in the case of the development server: http://localhost:3000/js).

The request body must be plain test. The result is also plain text, a stringified JSON.

For example, if the request body is:  
```javascript
const x = 1;
x + 10
```
the response body will be:
`'11'`

Currently, the code execution is time-boxed to 1.5 seconds. 

### Request payloads and responses
See the [tests](./tests/rest.spec.js)
