# React Native Change Port

usage on package.json
```js
{
  // ...,
  "scripts": {
    // ...,
    "postinstall": "npx -y rn-change-port 6789"
  }
}
```

## manual

npx rn-change-port [PORT] [ReactNativePath]

+ **PORT**: port that metro will listen on
+ **ReactNativePath**: path to react native root folder, use it when you place react native project on another location (ex. use with lerna)

## notice

This module patch 2 files in pod `React-Core`, so if you call `pod install`, you should manually execute command `npx -y rn-change-port xxx` once before build

+ If you get error
```text
Error: EISDIR: illegal operation on a directory, read
    at Object.readSync (fs.js:568:3)
    at tryReadSync (fs.js:353:20)
    at Object.readFileSync (fs.js:390:19)
    at UnableToResolveError.buildCodeFrameMessage (./node_modules/metro/src/node-haste/DependencyGraph/ModuleResolution.js:348:17)
    at new UnableToResolveError (./node_modules/metro/src/node-haste/DependencyGraph/ModuleResolution.js:334:35)
    at ModuleResolver.resolveDependency (./node_modules/metro/src/node-haste/DependencyGraph/ModuleResolution.js:212:15)
    at DependencyGraph.resolveDependency (./node_modules/metro/src/node-haste/DependencyGraph.js:413:43)
    at ./node_modules/metro/src/lib/transformHelpers.js:317:42
    at ./node_modules/metro/src/Server.js:1471:14
    at Generator.next (<anonymous>)
```

You must `cd into-react-native-project` and run `yarn start` before build android or ios
