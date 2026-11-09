import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * Custom blocks that editors can drop into a post body. Each one maps to a
 * component on the site (beauty-dope-fe/src/components/blog/blocks.tsx), so
 * keep names and fields in sync with the frontend when changing them.
 */

export const SKIN_TYPES = ['All', 'Normal', 'Oily', 'Dry', 'Combination', 'Sensitive', 'Acne-prone', 'Mature']

export const ingredientItem = defineType({
  name: 'ingredientItem',
  title: 'Ingredient',
  type: 'object',
  fields: [
    defineField({name: 'name', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'inci', title: 'INCI name', type: 'string', description: 'Shown under the name when different from it.'}),
    defineField({name: 'benefit', type: 'text', rows: 3, validation: (r) => r.required()}),
    defineField({
      name: 'skinTypes',
      title: 'Good for',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
      options: {list: SKIN_TYPES, layout: 'grid'},
    }),
    defineField({name: 'caution', type: 'text', rows: 2, description: 'Optional warning, shown in amber.'}),
  ],
  preview: {select: {title: 'name', subtitle: 'benefit'}},
})

export const ingredientCards = defineType({
  name: 'ingredientCards',
  title: 'Ingredient cards',
  type: 'object',
  fields: [
    defineField({
      name: 'layout',
      type: 'string',
      options: {list: [{title: 'Stacked', value: 'stack'}, {title: 'Two-column grid', value: 'grid'}], layout: 'radio', direction: 'horizontal'},
      initialValue: 'stack',
    }),
    defineField({
      name: 'items',
      title: 'Ingredients',
      type: 'array',
      of: [defineArrayMember({type: 'ingredientItem'})],
      validation: (r) => r.required().min(1),
    }),
  ],
  preview: {
    select: {items: 'items', layout: 'layout'},
    prepare: ({items, layout}) => ({
      title: `Ingredients: ${(items ?? []).map((i: {name?: string}) => i.name).filter(Boolean).join(', ') || '—'}`,
      subtitle: layout === 'grid' ? 'Ingredient cards · grid' : 'Ingredient cards · stacked',
    }),
  },
})

export const callout = defineType({
  name: 'callout',
  title: 'Tip / warning box',
  type: 'object',
  fields: [
    defineField({
      name: 'tone',
      type: 'string',
      options: {list: [{title: 'Tip', value: 'tip'}, {title: 'Warning', value: 'warning'}], layout: 'radio', direction: 'horizontal'},
      initialValue: 'tip',
      validation: (r) => r.required(),
    }),
    defineField({name: 'text', type: 'text', rows: 3, validation: (r) => r.required()}),
  ],
  preview: {
    select: {tone: 'tone', text: 'text'},
    prepare: ({tone, text}) => ({title: text, subtitle: tone === 'warning' ? '⚠️ Warning box' : '💡 Tip box'}),
  },
})

export const tableRow = defineType({
  name: 'tableRow',
  title: 'Row',
  type: 'object',
  fields: [defineField({name: 'cells', type: 'array', of: [defineArrayMember({type: 'string'})]})],
  preview: {select: {cells: 'cells'}, prepare: ({cells}) => ({title: (cells ?? []).join(' | ')})},
})

export const dataTable = defineType({
  name: 'dataTable',
  title: 'Table',
  type: 'object',
  fields: [
    defineField({name: 'headers', title: 'Column headers', type: 'array', of: [defineArrayMember({type: 'string'})], validation: (r) => r.required().min(1)}),
    defineField({
      name: 'rows',
      type: 'array',
      of: [defineArrayMember({type: 'tableRow'})],
      validation: (r) =>
        r.custom((rows: {cells?: string[]}[] | undefined, ctx) => {
          const cols = ((ctx.parent as {headers?: string[]})?.headers ?? []).length
          const bad = (rows ?? []).findIndex((row) => (row.cells ?? []).length !== cols)
          return bad === -1 ? true : `Row ${bad + 1} should have ${cols} cells, one per column header`
        }),
    }),
  ],
  preview: {
    select: {headers: 'headers', rows: 'rows'},
    prepare: ({headers, rows}) => ({title: `Table: ${(headers ?? []).join(' | ')}`, subtitle: `${(rows ?? []).length} rows`}),
  },
})

export const productPick = defineType({
  name: 'productPick',
  title: 'Product',
  type: 'object',
  fields: [
    defineField({name: 'brand', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'name', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'price', type: 'string', description: 'As displayed, e.g. ₹600'}),
    defineField({name: 'why', title: 'Why we picked it', type: 'text', rows: 2}),
  ],
  preview: {select: {title: 'name', subtitle: 'brand'}},
})

export const productPicks = defineType({
  name: 'productPicks',
  title: 'Product picks',
  type: 'object',
  fields: [defineField({name: 'products', type: 'array', of: [defineArrayMember({type: 'productPick'})], validation: (r) => r.required().min(1)})],
  preview: {
    select: {products: 'products'},
    prepare: ({products}) => ({
      title: `Product picks: ${(products ?? []).map((p: {name?: string}) => p.name).filter(Boolean).join(', ') || '—'}`,
    }),
  },
})

export const checklistItem = defineType({
  name: 'checklistItem',
  title: 'Checklist item',
  type: 'object',
  fields: [
    defineField({name: 'label', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'note', type: 'string'}),
  ],
  preview: {select: {title: 'label', subtitle: 'note'}},
})

export const checklist = defineType({
  name: 'checklist',
  title: 'Checklist',
  type: 'object',
  fields: [defineField({name: 'items', type: 'array', of: [defineArrayMember({type: 'checklistItem'})], validation: (r) => r.required().min(1)})],
  preview: {select: {items: 'items'}, prepare: ({items}) => ({title: `Checklist (${(items ?? []).length} items)`})},
})

/** The post body: rich text plus the blocks above and inline images. */
export const blockContent = defineType({
  name: 'blockContent',
  title: 'Body',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [
        {title: 'Paragraph', value: 'normal'},
        {title: 'Heading', value: 'h2'},
        {title: 'Subheading', value: 'h3'},
      ],
      lists: [
        {title: 'Bullets', value: 'bullet'},
        {title: 'Numbered', value: 'number'},
      ],
      marks: {
        decorators: [
          {title: 'Bold', value: 'strong'},
          {title: 'Italic', value: 'em'},
        ],
        annotations: [
          defineArrayMember({
            name: 'link',
            type: 'object',
            title: 'Link',
            fields: [
              defineField({
                name: 'href',
                type: 'url',
                title: 'URL',
                description: 'https://… for other sites, or a site path like /dupes',
                validation: (r) => r.uri({scheme: ['http', 'https', 'mailto'], allowRelative: true}),
              }),
            ],
          }),
        ],
      },
    }),
    defineArrayMember({
      type: 'image',
      options: {hotspot: true},
      fields: [
        defineField({name: 'alt', title: 'Alt text', type: 'string', description: 'Describe the image for screen readers and SEO.', validation: (r) => r.required()}),
        defineField({name: 'caption', type: 'string'}),
      ],
    }),
    defineArrayMember({type: 'ingredientCards'}),
    defineArrayMember({type: 'callout'}),
    defineArrayMember({type: 'dataTable'}),
    defineArrayMember({type: 'productPicks'}),
    defineArrayMember({type: 'checklist'}),
  ],
})
