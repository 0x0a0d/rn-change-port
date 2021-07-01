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
