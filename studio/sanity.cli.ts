import {defineCliConfig} from 'sanity/cli'
import {projectId, dataset} from './env'

export default defineCliConfig({
  api: {projectId, dataset},
  // `npm run deploy` asks for a hostname the first time (e.g. skinevora → skinevora.sanity.studio).
  // Auto-updates off so the deployed Studio runs exactly the pinned version.
  deployment: {autoUpdates: false},
})
