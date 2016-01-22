import setCompiler from 'cerebral-url-scheme-compiler/set'
import toDisplayName from '../helpers/toDisplayName'

export default function (path, value) {
  const setValue = setCompiler(path)

  const set = function set (args) {
    const response = setValue(args, value)
    if (response && response.then) {
      response.then(args.output.success).catch(args.output.error)
    }
  }

  set.displayName = `set(${toDisplayName(path, setValue)}, ${JSON.stringify(value)})`

  return set
}
