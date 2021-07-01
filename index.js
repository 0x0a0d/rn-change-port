#!/usr/bin/env node
const fs = require('fs')
const path = require('path')

const port = parseInt(process.argv[2])
const pathReactNative = path.resolve(process.cwd(), process.argv[3] || '.')

if (isNaN(port) || !(port > 0 && port < Math.pow(2, 16))) {
  console.error('Port is required')
  console.log('Usage: patch-port PORT')
  process.exit(1)
}

const modifyFile = (paths, findRegex, replace) => {
  if (Array.isArray(paths)) {
    paths.forEach(p => modifyFile(p, findRegex, replace))
    return
  }
  if (!fs.existsSync(paths)) {
    console.warn(`Missing Pod file: ${paths}`)
  }
  const content = fs.readFileSync(paths, 'utf8')
  fs.writeFileSync(paths, content.replace(findRegex, replace))
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
      json.scripts[cmd] = json.scripts[cmd].replace(/\s+--port\s+\d+/g, '') + ` --port ${port}`
    } catch (e) {
      console.error(`package.json: modify scripts.${cmd} failed`)
      process.exit(1)
    }
  }
  fs.writeFileSync(packagePath, JSON.stringify(json, null, 4))
}

const xcodeModify = () => {
  const proj = fs.readdirSync(`${pathReactNative}/ios`).find(file => file.endsWith('.xcodeproj'))
  if (proj == null) {
    console.error('Could not detect project xcode file. But you can ignore this')
    return
  }
  modifyFile(`${pathReactNative}/ios/${proj}/project.pbxproj`, /RCT_METRO_PORT:=\d+/, `RCT_METRO_PORT:=${port}`)
}

const pods = [
  `${pathReactNative}/ios/Pods/Headers/Public/React-Core/React/RCTDefines.h`,
  `${pathReactNative}/ios/Pods/Headers/Private/React-Core/React/RCTDefines.h`,
]
modifyPackageJson()
modifyFile(pods, /^#define RCT_METRO_PORT\s+\d+$/mg, `#define RCT_METRO_PORT ${port}`)
modifyFile('./node_modules/react-native/Libraries/Core/Devtools/getDevServer.js', /^const FALLBACK = 'http:\/\/localhost:\d+\/';$/g, `const FALLBACK = 'http://localhost:${port}/';`)
xcodeModify()
