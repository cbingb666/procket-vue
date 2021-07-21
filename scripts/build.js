const { resolve } = require('path')
const { rollup } = require('rollup') // 引入rollup
const commonjs = require('@rollup/plugin-commonjs') // rollup默认支持es6的模块系统，需要支持commonjs的话需要这个插件
const { nodeResolve } = require('@rollup/plugin-node-resolve') // 一个使用 Node 解析算法定位模块的 Rollup 插件，用于在 node_modules 中使用第三方模块
const { getBabelOutputPlugin } = require('@rollup/plugin-babel') // rollup的 babel 插件
const typescript = require('@rollup/plugin-typescript') // rollup的 typescript 插件
const isPkgExist = require('./utils/isPkgExist')
const fs = require('fs')
const arg = process.argv[2] // 拿到 npm run build packName 中的packName
const _resolve = (...dir) => resolve(process.cwd(), ...dir)
const packagesDir = _resolve('packages')

/**
 * 创建rollup配置
 * @param {string} pkgName - 包名
 */
function createOptions(pkgName) {
  // 子包所在的路劲
  const packDir = _resolve(packagesDir, pkgName)

  // 输入的文件配置
  const inputOptions = {
    input: `${packDir}/src/index.ts`,
    plugins: [
      nodeResolve(),
      typescript(),
      commonjs(),
      // babel({
      //   // babel文件的设置，会读取根目录的babel.config.js文件配置
      //   babelHelpers: 'bundled',
      // }),
    ]
  }

  // 输出的配置
  const outputOptions = [
    {
      file: `${packDir}/lib/${pkgName}.esm.js`,
      format: 'esm',
      name: `${pkgName}`,
      plugins: [
        getBabelOutputPlugin({
          presets: ['@babel/preset-env']
        })
      ]
    },
    {
      file: `${packDir}/lib/${pkgName}.cjs.js`,
      format: 'cjs',
      name: `${pkgName}`
    },
    {
      file: `${packDir}/lib/${pkgName}.umd.js`,
      format: 'umd',
      name: `${pkgName}`,
    }
  ]

  return { inputOptions, outputOptions }
}

/**
 * 单个build
 * @param {string} pkgName - 包名
 */
async function build(pkgName) {
  // valid packageName
  if (!isPkgExist(pkgName)) {
    throw `${pkgName} 包不存在`
  }

  // create options
  const { inputOptions, outputOptions } = createOptions(pkgName)

  // create a bundle
  const bundle = await rollup(inputOptions) // inputOptions放在这里

  console.log(bundle.watchFiles) // an array of file names this bundle depends on

  outputOptions.map(async outOpt => {
    await bundle.write(outOpt)
  })
}

/**
 * build全部
 */
async function buildFull() {
  const packNames = fs.readdirSync(packagesDir)

  for (let name of packNames) {
    await build(name)
  }
}

/**
 * 入口
 */
function main() {
  if (!arg) {
    buildFull()
  } else {
    build(arg)
  }
}

main()
