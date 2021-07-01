# React Native Change Port

usage on package.json
```json
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
