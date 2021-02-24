# moki
## npm modules
Two npm modules are provided currently for the client component:
1. `@moki-client/gui` - provides the GUI features related to decryption;
2. `@moki-client/es-response-parser` - provides the parsers which process the responses for ES RESTful API queries;


The modules are configured as GIT URL (`git+ssh`) depencies in the [package.json](https://github.com/intuitivelabs/moki/blob/master/Moki/client/package.json) file. They are downloaded from their repositories by calling `npm install` in the `client` directory. For more details on npm dependencies using GIT URL see
[online npm documentation](https://docs.npmjs.com/cli/v7/configuring-npm/package-json#git-urls-as-dependencies) or `man package.json`.

Public vs. [intuitivelabs](www.intuitivelabs.com) private versions are installed by specifying the respective GIT URL in the [package.json](https://github.com/intuitivelabs/moki/blob/master/Moki/client/package.json) file. Currently these are the GIT URLs:
1. public version:
  * [es-response-parser](https://github.com/intuitivelabs/es-response-parser);
  * [moki-gui](https://github.com/intuitivelabs/moki-gui);
2. [intuitivelabs](www.intuitivelabs.com) private version:
  * [es-response-parser-private](https://github.com/intuitivelabs/es-response-parser-private);
  * [moki-gui-intuitive](https://github.com/intuitivelabs/moki-gui-intuitive). this module implements only decryption specific functionality and re-exports most of the functions/objects in the public version module [es-response-parser](https://github.com/intuitivelabs/es-response-parser), which is using as a dependency;

For example, here is how the [intuitivelabs](www.intuitivelabs.com) private version of the npm modules could be configured in `package.json`:
```
  "dependencies": {
    "@moki-client/es-response-parser": "git+ssh://git@github.com/intuitivelabs/es-response-parser-private.git#25ffb8d",
    "@moki-client/gui": "git+ssh://git@github.com/intuitivelabs/moki-gui-intuitive.git#83dacd2",
    ...
  },
```
### install the dependencies
run `npm install` in the `client` directory.

### build everything
run `npm run-scripts build` in the `client` directory.

`@moki-client/gui` requires `jsx` file translation (i.e. translating react `jsx` files into `js` files by using `babel`). this translation is triggered automatically when `npm run-scripts build` is run. it is driven by the `scripts` session of [package.json](https://github.com/intuitivelabs/moki/blob/master/Moki/client/package.json):
```
"scripts": {
    "start": "react-scripts start",
    "build": "(cd ./node_modules/@moki-client/gui/; npm run build) && react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
 ```
