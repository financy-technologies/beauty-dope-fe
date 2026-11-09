import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import {projectId, dataset} from './env'

export default defineConfig({
  name: 'skinevora',
  title: 'Skinevora Blog',
  projectId,
  dataset,
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.listItem()
              .title('Blog posts')
              .schemaType('post')
              .child(S.documentTypeList('post').title('Blog posts').defaultOrdering([{field: 'publishedAt', direction: 'desc'}])),
          ]),
    }),
    // GROQ playground, handy for checking what the API will return.
    visionTool({defaultApiVersion: '2025-02-19'}),
  ],
  schema: {types: schemaTypes},
})
