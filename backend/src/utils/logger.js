import chalk from 'chalk'

const timestamp = () =>
  new Date().toLocaleString('en-GB', { hour12: false })

// Độ rộng tối đa cho label (SUCCESS = 7)
const LABEL_WIDTH = 7

const format = (label, labelColor, textColor, message) => {
  const paddedLabel = label.padEnd(LABEL_WIDTH, ' ') // căn đều
  console.log(
    chalk.gray(`[${timestamp()}]`) +
    '  ' +
    labelColor(paddedLabel) +
    '  ' +
    textColor(message)
  )
}

export const logger = {
  info: (msg) => format('INFO', chalk.blue, chalk.cyan, msg),
  success: (msg) => format('SUCCESS', chalk.green, chalk.greenBright, msg),
  warn: (msg) => format('WARN', chalk.yellow, chalk.yellowBright, msg),
  error: (msg) => format('ERROR', chalk.red, chalk.redBright, msg),
  debug: (msg) => format('DEBUG', chalk.magenta, chalk.magentaBright, msg),
  start: (msg) => format("START", chalk.hex("#9d4edd"), chalk.hex("#9d4edd"), msg),
}
