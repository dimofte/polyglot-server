# Simple virtual machine for python

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
Requests are made via `POST` to `/python` (in the case of the development server:
http://localhost:3000/python).

The request body must be plain test. The result is also plain text, a stringified JSON.

The returned result is whatever was printed, each `print` call generating an element in an array. 
For example, if the request body is:  
```
x = 1
while x < 5:
    print(x)
    x = x + 1
```
the response body will be:
`'["1","2","3","4"]'`


For more details, see the [tests](./tests/rest.spec.js)

## Security concerns :warning:

At the current iteration, the script executer has access to all resources of the user
that runs the node server :birthday:

*So use with caution!!!* 