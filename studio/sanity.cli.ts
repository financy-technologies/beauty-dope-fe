import {defineCliConfig} from 'sanity/cli'
import {projectId, dataset} from './env'

export default defineCliConfig({
  api: {projectId, dataset},
  // `npm run deploy` publishes to https://skinevora.sanity.studio
  studioHost: 'skinevora',
  // Auto-updates off so the deployed Studio runs exactly the pinned version.
  deployment: {appId: 'o2iq1z0sar54yrao52zz8i39', autoUpdates: false},
})
