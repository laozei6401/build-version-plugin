const path = require("path")
const { execSync } = require("child_process")

function execCommand(command) {
    return execSync(command, {encoding: "utf-8"}).toString().replace(/\n/g, "")
}

class BuildVersionPlugin {
    constructor(options = {}) {
        this.options = options
    }

    apply(compiler) {
        const pkg = require(`${path.resolve(compiler.context, "package.json")}`)
        const data = {
            ...this.options.customInfo || {},
            date: new Date().toLocaleString(),
            version: pkg.version,
            user: execCommand("git config user.name"),
            branch: execCommand("git branch --show-current"),
            commitId: execCommand("git rev-parse HEAD")
        }

        compiler.hooks.emit.tap("BuildVersionPlugin", compilation => {
            const content = JSON.stringify(data, null, 2)

            compilation.assets["version.json"] = {
                size: () => content.length,
                source: () => content
            }
        })
    }
}

module.exports = BuildVersionPlugin