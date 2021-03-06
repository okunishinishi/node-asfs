
'use strict'

const fs = require('fs')
const aglob = require('aglob')
const path = require('path')
const filecopy = require('filecopy')
const mkdirp = require('mkdirp')

const asfs = module.exports = Object.assign(
  /**
   * @namespace asfs
   */
  {
    /**
     * Check file exists
     * @param {string} filename
     * @returns {Promise.<boolean>}
     */
    async existsAsync(filename) {
      return new Promise((resolve) =>
        fs.exists(filename, (exists) => resolve(exists))
      )
    },

    /**
     * Make directories with parent option.
     * @param {string} dirname
     * @returns {Promise}
     */
    async mkdirpAsync(dirname) {
      return mkdirp(dirname)
    },

    /**
     * Read file
     * @param {string} filename
     * @param {string} [encode]
     * @returns {Promise}
     */
    async readFileAsync(filename, encode) {
      const args = [...arguments]
      return new Promise((resolve, reject) =>
        fs.readFile(...args.concat((err, content) => err ? reject(err) : resolve(content)))
      )
    },

    /**
     * Write a file
     * @param {string} filename
     * @param {string} content
     * @returns {Promise}
     */
    async writeFileAsync(filename, content) {
      const args = [...arguments]
      return new Promise((resolve, reject) =>
        fs.writeFile(...args.concat((err) => err ? reject(err) : resolve()))
      )
    },

    /**
     * Unlink a file
     * @param {string} filename
     * @returns {Promise}
     */
    async unlinkAsync(filename) {
      return new Promise((resolve, reject) =>
        fs.unlink(filename, (err) => err ? reject(err) : resolve())
      )
    },

    /**
     * Get state of a file
     * @param {string} filename
     * @returns {Promise}
     */
    async statAsync(filename) {
      return new Promise((resolve, reject) =>
        fs.stat(filename, (err, stat) => err ? reject(err) : resolve(stat))
      )
    },

    /**
     * Rename a file
     * @param {string} from
     * @param {string} to
     * @returns {Promise}
     */
    async renameAsync(from, to) {
      return new Promise((resolve, reject) =>
        fs.rename(from, to, (err) => err ? reject(err) : resolve())
      )
    },

    /**
     * Read directory
     * @param {string} dirname
     * @param {Object} [options]
     * @returns {Promise}
     */
    async readdirAsync(dirname, options = {}) {
      return new Promise((resolve, reject) =>
        fs.readdir(dirname, options, (err, result) => err ? reject(err) : resolve(result))
      )
    },

    /**
     * Check if file can write
     * @param {string} filename
     * @returns {Promise<*>}
     */
    async canWriteAsync(filename) {
      return new Promise((resolve, reject) => {
        fs.access(filename, fs.constants.W_OK, (err) => {
          resolve(!err)
        })
      })
    },

    /**
     * Check if file can read
     * @param {string} filename
     * @returns {Promise<*>}
     */
    async canReadAsync(filename) {
      return new Promise((resolve, reject) => {
        fs.access(filename, fs.constants.R_OK, (err) => {
          resolve(!err)
        })
      })
    },

    /**
     * Copy a file
     * @param {string} src - Source file
     * @param {string} dest - Destination file
     * @param {Object} [options={}]
     * @returns {Promise<void>}
     */
    async copyAsync(src, dest, options = {}) {
      await filecopy(src, dest, { mkdirp: true })
    },

    /**
     * Copy directory
     * @param {string} src - Source directory
     * @param {string} dest - Destination directory
     * @param {Object} [options={}] - Optional settings
     * @returns {Promise}
     */
    async copyDirAsync(src, dest, options = {}) {
      const {
        pattern = '**/*',
        ignore = []
      } = options
      const filenames = await aglob(pattern, {
        ignore,
        cwd: src,
        dot: true
      })
      for (const filename of filenames) {
        const srcPath = path.resolve(src, filename)
        const destPath = path.resolve(dest, filename)
        const stat = await asfs.statAsync(srcPath)
        if (stat.isDirectory()) {
          await asfs.mkdirpAsync(destPath)
        } else{
          await filecopy(srcPath, destPath, { mkdirp: true })
        }
      }
    }
  })
