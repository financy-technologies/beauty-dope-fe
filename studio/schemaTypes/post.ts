import {defineArrayMember, defineField, defineType} from 'sanity'

/** Keep in sync with TAG_COLOR_CLASSES in beauty-dope-fe/src/lib/blog.ts. */
export const TAG_COLORS = [
  {title: 'Teal (brand)', value: 'teal'},
  {title: 'Amber', value: 'amber'},
  {title: 'Rose', value: 'rose'},
  {title: 'Sky', value: 'sky'},
  {title: 'Violet', value: 'violet'},
  {title: 'Emerald', value: 'emerald'},
]

export const post = defineType({
  name: 'post',
  title: 'Blog post',
  type: 'document',
  groups: [
    {name: 'content', title: 'Content', default: true},
    {name: 'meta', title: 'Details'},
  ],
  fields: [
    defineField({name: 'title', type: 'string', group: 'content', validation: (r) => r.required().max(120)}),
    defineField({
      name: 'slug',
      type: 'slug',
      group: 'content',
      description: 'The URL: skinevora.com/blog/<slug>. Changing it after publishing breaks existing links.',
      options: {source: 'title', maxLength: 96},
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'excerpt',
      type: 'text',
      rows: 3,
      group: 'content',
      description: 'Shown on the blog list and used as the search-engine description.',
      validation: (r) => r.required().max(300),
    }),
    defineField({
      name: 'coverImage',
      type: 'image',
      group: 'content',
      options: {hotspot: true},
      fields: [defineField({name: 'alt', title: 'Alt text', type: 'string'})],
    }),
    defineField({
      name: 'coverEmoji',
      type: 'string',
      group: 'content',
      description: 'Shown instead of a cover image when there is none.',
      initialValue: '🧴',
      validation: (r) => r.max(8),
    }),
    defineField({name: 'body', type: 'blockContent', group: 'content', validation: (r) => r.required()}),

    defineField({
      name: 'publishedAt',
      title: 'Publish date',
      type: 'datetime',
      group: 'meta',
      description: 'Posts with a future date stay hidden until then.',
      initialValue: () => new Date().toISOString(),
      validation: (r) => r.required(),
    }),
    defineField({name: 'author', type: 'string', group: 'meta', initialValue: 'Skinevora Editorial', validation: (r) => r.required()}),
    defineField({
      name: 'tag',
      type: 'string',
      group: 'meta',
      description: 'Pick one or type a new one.',
      options: {list: ['Ingredient Deep Dive', 'Actives Guide', 'Skin Goals', 'Routines', 'Dupes']},
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'tagColor',
      title: 'Tag colour',
      type: 'string',
      group: 'meta',
      options: {list: TAG_COLORS, layout: 'radio', direction: 'horizontal'},
      initialValue: 'teal',
    }),
    defineField({
      name: 'readingTimeMinutes',
      title: 'Reading time (minutes)',
      type: 'number',
      group: 'meta',
      description: 'Leave empty to calculate it from the word count.',
      validation: (r) => r.min(1).max(60).integer(),
    }),
    defineField({
      name: 'relatedPosts',
      type: 'array',
      group: 'meta',
      description: 'Up to 3. If empty, the latest other posts are shown.',
      of: [defineArrayMember({type: 'reference', to: [{type: 'post'}]})],
      validation: (r) => r.max(3).unique(),
    }),
  ],
  orderings: [{title: 'Publish date, newest', name: 'publishedAtDesc', by: [{field: 'publishedAt', direction: 'desc'}]}],
  preview: {
    select: {title: 'title', date: 'publishedAt', tag: 'tag', media: 'coverImage', emoji: 'coverEmoji'},
    prepare: ({title, date, tag, media, emoji}) => ({
      title,
      subtitle: [tag, date ? new Date(date).toLocaleDateString('en-IN', {day: 'numeric', month: 'short', year: 'numeric'}) : 'No date'].filter(Boolean).join(' · '),
      media: media ?? (emoji ? () => emoji : undefined),
    }),
  },
})
