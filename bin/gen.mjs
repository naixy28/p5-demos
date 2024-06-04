#!usr/bin/env zx
import 'zx/globals'

const defaultConfig = {
  template: 'p5',
}

// read template name from argv 'template'
const template = argv.template || defaultConfig.template
const templatePath = `templates/${template}_template`

// try if the template exists
try {
  await fs.access(templatePath)
} catch (e) {
  console.error(`Template ${template} not found`)
}

const projectName = await question('Project name:')

const nameExists = await fs.exists(`./${projectName}`)
if (!projectName || nameExists) {
  console.error('Need a valid project name')
  process.exit(0)
}

// copy template to current directory and rename it
await fs.copy(templatePath, `./${projectName}`)
console.log(`Created ${projectName} from template ${template}`)
