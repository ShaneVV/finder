#! /usr/bin/env node

const klaw = require('klaw')
const fs = require('fs-extra')

const path = require('path')

const cwd = process.cwd()

const resolve = (pathname) => {
    return path.posix.join(cwd, pathname)
}

/**
 * args:
 *
 * src
 * dest
 * key
 */

const checkArgs = () => {
    const src = resolve(process.argv[2])
    const dest = resolve(process.argv[3])
    const key = '.' + process.argv[4]

    return {
        src,
        dest,
        key
    }
}

const existNames = new Set()
const moveFiles = (files, destDir, srcDir) => {
    files.forEach((filePath, index) => {
        let filename = path.parse(filePath).base
        if (existNames.has(filename)) {
            filename = path.parse(filePath).name + index + path.parse(filePath).ext
            existNames.add(filename)
        } else {
            existNames.add(filename)
        }

        // const relPath = path.relative(srcDir, filePath)
        // const dest = path.posix.join(destDir, relPath)

        const dest = path.posix.join(destDir, filename)
        fs.copySync(filePath, dest)
    })
}

const args = checkArgs()
console.log(args)

let needMoveFiles = []
klaw(args.src)
    .on('data', file => {
        const ext = path.parse(file.path).ext
        if (ext === args.key) needMoveFiles.push(file.path)
    })
    .on('end', () => {
        console.log(needMoveFiles)
        moveFiles(needMoveFiles, args.dest, args.src)
    })
    .on('error', err => {
        throw err
    })

