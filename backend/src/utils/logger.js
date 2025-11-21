import chalk from 'chalk'

const getTimestamp = () => {
  const now = new Date()
  return now.toLocaleString('en-GB', {
    hour12: false,
  }) 
}

const base = (label, colorFn, message) => {
  console.log(
    `${chalk.gray(`[${getTimestamp()}]`)} ` +
      colorFn.bold(` ${label} `) +
      chalk.white(`→ ${message}`)
  )
}

export const logger = {
  info: (msg) => base('INFO', chalk.blue, msg),
  success: (msg) => base('SUCCESS', chalk.green, msg),
  warn: (msg) => base('WARN', chalk.yellow, msg),
  error: (msg) => base('ERROR', chalk.red, msg),
  debug: (msg) => base('DEBUG', chalk.magenta, msg),
  http: (msg) => base('HTTP', chalk.cyan, msg),
}
