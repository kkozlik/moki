# README.md

## What

`moki-express-app` is a 

The api is written in `nodejs`, using the `express` framework. 

A elk connection blablabla

The project can be run in docker, but npm is required if you want to run in developement mode. 
The `node_modules` directory need to be in the root package, but the root directory is also 
shared via a volume with the docker. 

The dev target of the docker iamge run the code via `nodemon`, which allow a hot reload of the content.

## Use it 

### dev 

- `make build` to build the docker image
- npm install to install the node_modules (so it's not missing at runtime)
- `make run` to run the docker image

Access 127.0.0.1:5000/api/docs :) or `curl 127.0.0.1:5000/api/docs.json`

### prod 

- `make build -e TARGET=prod`
- `make run`

## project

### nodejs

A JSON API, contacting redis, serving a swagger doc. 

#### external library 

Use of: [`express`](1), [`express-prettify`](2), [`swagger-ui-express`](3), [`swagger-jsdoc`](4), [`morgan`](5), [`dotenv`](8), [`mocha`](9), [`chai`](10)


[1]: https://github.com/expressjs/express
[2]: https://github.com/stipsan/express-prettiffy

#### targets

| **target** | **description**                          | **where**      |
| :-         | :-                                       | -:             |
| `lint`     | run eslint                               | `package.json` |
| `lintfix`  | run eslint + fixer                       | `package.json` |
| `pretty`   | run prettier                             | `package.json` |
| `start`    | start the API server                     | `package.json` |
| `test`     | run the test via mocha                   | `package.json` |
| `swagger`  | generate a swagger.json file             | `package.json` |
| `coverage` | generate code coverage                   | `package.json` |
| `codecov`  | generate and publish coverage to codecov | `package.json` |

#### Makefile

```
16:33:57 ❯ make help              
Usage:
moki-express-app   Default target, run build
  build                    Build the nodejs docker image (default target)
  build-prod               Build a production readu nodejs docker image
  run                      Run the nodejs server from the docker image
  exec                     Run a custom command inside a running the docker container
  stop                     Stop the docker image
  lint                     Run the linter
  all                      Build then run the dockerized nodejs
  help                     Prints this help message
```

### docker

The dockerfile hold 2 steps : `dev` and `prod`. Provide the `--target` arguemnt to `docker build` 
to stop at the desired target.
