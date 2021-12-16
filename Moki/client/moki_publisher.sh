#!/usr/bin/bash

npm config set //npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
npm config set @intuitivelabs:registry=https://npm.pkg.github.com

npm publish
