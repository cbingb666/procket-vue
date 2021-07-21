const { echo, exec, exit } = require('shelljs')
const { resolve } = require('path')
const isPkgExist = require('./utils/isPkgExist')
const rootPkg = require('../package.json')
const fs = require('fs')
const pkgName = process.argv[2] // 拿到 npm run build packName 中的packName

if (!pkgName) {
  echo('缺少pkgName')
  exit(1)
}

const rootPath = process.cwd()
const pkgNamePath = resolve(rootPath, 'packages', pkgName)
const resolvePkg = (...dir) => resolve(pkgNamePath, ...dir)

if (isPkgExist(pkgName)) {
  echo(`${pkgName} 包已存在`)
  exit(1)
}

const createSh = exec(`lerna create ${pkgName} --description ${pkgName} --yes`)
if (createSh.code !== 0) {
  echo('create fail')
  exit(1)
} else {
  fs.rmdirSync(resolvePkg('lib'), { recursive: true, force: true })
  fs.mkdirSync(resolvePkg('src'))
  fs.writeFileSync(resolvePkg('src/index.ts'), '')
  let pkgJSON = JSON.parse(fs.readFileSync(resolvePkg('package.json')))
  pkgJSON.name = `@${rootPkg.name}/${pkgName}`
  pkgJSON.main = `lib/${pkgName}.cjs.js`
  pkgJSON.module = `lib/${pkgName}.esm.js`
  pkgJSON.browser = `lib/${pkgName}.umd.js`
  pkgJSON.publishConfig = {
    access: 'public'
  }
  fs.writeFileSync(resolvePkg('package.json'), JSON.stringify(pkgJSON, null, 2))
  echo(`create ${pkgName} success`)
}
