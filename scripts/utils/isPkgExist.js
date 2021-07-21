const { pwd, find } = require('shelljs')
const { join } = require('path')
const rootPath = pwd().stdout

/**
 * 校验包是否存在
 * @param {string} pkgName - 包名
 */
function isPkgExist(pkgName) {
  const pkgNamePath = join(rootPath, 'packages', pkgName)
  const findRes = find(pkgNamePath)
  return findRes.code === 0
}

module.exports = isPkgExist