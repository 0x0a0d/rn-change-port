#!/usr/bin/env node
const fs = require('fs')
const path = require('path')

const port = parseInt(process.argv[2], 10)
const pathReactNative = path.resolve(process.cwd(), process.argv[3] || '.')

if (isNaN(port) || !(port > 0 && port < Math.pow(2, 16))) {
  console.error('Port is required')
  console.log('Usage: patch-port PORT')
  process.exit(1)
}

const modifyFile = (file, findRegex, replace) => {
  if (Array.isArray(file)) {
    file.forEach(filePath => modifyFile(filePath, findRegex, replace))
    return
  }
  const filePath = path.resolve(pathReactNative, file)
  if (!fs.existsSync(filePath)) {
    console.warn(`Missing file: ${filePath}`)
  }
  const content = fs.readFileSync(filePath, 'utf8')
  fs.writeFileSync(filePath, content.replace(findRegex, replace))
}

const modifyPackageJson = () => {
  const packagePath = path.resolve(pathReactNative, 'package.json')
  let json
  try {
    json = require(packagePath)
  } catch (e) {
    console.error('package.json not found')
    process.exit(1)
  }
  for (const cmd of ['android', 'ios', 'start']) {
    try {
      json.scripts[cmd] = json.scripts[cmd]
        .replace(/\s+--port\s+\d+/g, '')
        .replace(/(^|\s+)RCT_METRO_PORT=\d+\s+/g, `\1RCT_METRO_PORT=${port} `) + ` --port ${port}`
    } catch (e) {
      console.error(`package.json: modify scripts.${cmd} failed`)
      process.exit(1)
    }
  }
  fs.writeFileSync(packagePath, JSON.stringify(json, null, 2))
}

const patchFiles = () => {
  const files = [
    [
      /RCT_METRO_PORT(\)?)\s+\|\|\s+(['"]?)\d+\2/g,
      (m, m1, m2) => `RCT_METRO_PORT${m1} || ${m2}${port}${m2}`,
      [
        './node_modules/@react-native-community/cli-hermes/build/profileHermes/index.js',
        './node_modules/@react-native-community/cli-platform-ios/build/commands/runIOS/index.js',
        './node_modules/@react-native-community/cli/build/tools/loadMetroConfig.js',
        './node_modules/@react-native-community/cli-tools/build/isPackagerRunning.js',
        './node_modules/@react-native-community/cli-platform-android/build/commands/runAndroid/index.js',
      ]
    ],
    [
      /port \|\| '8081'/, `port || '${port}'`, './node_modules/@react-native-community/cli-hermes/build/profileHermes/sourcemapUtils.js'
    ],
    [
      /^#define RCT_METRO_PORT\s+\d+$/mg,
      `#define RCT_METRO_PORT ${port}`,
      [
        './ios/Pods/Headers/Public/React-Core/React/RCTDefines.h',
        './ios/Pods/Headers/Private/React-Core/React/RCTDefines.h',
      ]
    ],
    [
      /^const FALLBACK = 'http:\/\/localhost:\d+\/';$/g, `const FALLBACK = 'http://localhost:${port}/';`,
      [
        './node_modules/react-native/Libraries/Core/Devtools/getDevServer.js',
      ]
    ],
    [
      />\d+</g, `>${port}<`, './node_modules/react-native/ReactAndroid/src/main/res/systeminfo/values/values.xml'
    ],
    [
      /localhost:\d+/, `localhost:${port}`, './node_modules/react-native/ReactAndroid/src/main/java/com/facebook/react/devsupport/DevSupportManagerBase.java'
    ],
    [
      /return value != null \? value : "\d+"/,
      `return value != null ? value : "${port}"`,
      './node_modules/react-native/ReactAndroid/build.gradle'
    ],
    [
      /NSNumber \*port = @\d+;/, `NSNumber *port = @${port};`,
      './node_modules/react-native/React/DevSupport/RCTInspectorDevServerHelper.mm'
    ],
    [
      /textField.placeholder = @"\d+";/, `textField.placeholder = @"${port}";`, './node_modules/react-native/React/CoreModules/RCTDevMenu.mm'
    ],
    [
      /default: \d+/, `default: ${port}`,
      [
        './node_modules/metro/node_modules/.bin/metro-inspector-proxy',
        './node_modules/metro-inspector-proxy/src/cli.js.flow',
        './node_modules/metro-inspector-proxy/src/cli.js',
        './node_modules/.bin/metro-inspector-proxy',
      ]
    ]
  ]
  const projs = fs.readdirSync(`${pathReactNative}/ios`).filter(file => file.endsWith('.xcodeproj'))
  if (projs.length === 0) {
    console.error('Could not detect project xcode file. But you can ignore this')
  } else {
    files.push([
      /RCT_METRO_PORT:=\d+/,
      `RCT_METRO_PORT:=${port}`,
      projs.map(proj => `ios/${proj}/project.pbxproj`)
    ])
  }
  return files
}

modifyPackageJson()

patchFiles(port, pathReactNative).forEach(([find, replace, paths]) => {
  modifyFile(paths, find, replace)
})
