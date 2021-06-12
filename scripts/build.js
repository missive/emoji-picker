var fs = require('fs'),
  emojiLibKeywords = require('emojilib'),
  emojiLibUnicode = require('unicode-emoji-json')
  inflection = require('inflection'),
  mkdirp = require('mkdirp')
  keyBy = require('lodash').keyBy

var { compress } = require('../dist/utils/data')

var categories = [
  ['Smileys & Emotion', 'smileys'],
  ['People & Body', 'people'],
  ['Animals & Nature', 'nature'],
  ['Food & Drink', 'foods'],
  ['Activities', 'activity'],
  ['Travel & Places', 'places'],
  ['Objects', 'objects'],
  ['Symbols', 'symbols'],
  ['Flags', 'flags'],
]

var sets = ['apple', 'facebook', 'google', 'twitter']

var emojiLibBySlug = selectEmojisBySlug(emojiLibKeywords, emojiLibUnicode)

module.exports = (options) => {
  delete require.cache[require.resolve('emoji-datasource')]
  var emojiData = require('emoji-datasource')

  var data = { compressed: true, categories: [], emojis: {}, aliases: {} },
    categoriesIndex = {}

  categories.forEach((category, i) => {
    let [name, id] = category
    data.categories[i] = { id: id, name: name, emojis: [] }
    categoriesIndex[name] = i
  })

  emojiData.sort((a, b) => {
    var aTest = a.sort_order || a.short_name,
      bTest = b.sort_order || b.short_name

    return aTest - bTest
  })

  emojiData.forEach((datum) => {
    var category = datum.category,
      keywords = [],
      categoryIndex

    if (!datum.category) {
      throw new Error('“' + datum.short_name + '” doesn’t have a category')
    }

    if (options.sets) {
      var keepEmoji = false

      options.sets.forEach((set) => {
        if (keepEmoji) return
        if (datum[`has_img_${set}`]) {
          keepEmoji = true
        }
      })

      if (!keepEmoji) {
        return
      }

      sets.forEach((set) => {
        if (options.sets.length == 1 || options.sets.indexOf(set) == -1) {
          var key = `has_img_${set}`
          delete datum[key]
        }
      })
    }

    datum.name || (datum.name = datum.short_name.replace(/\-/g, ' '))
    datum.name = inflection.titleize(datum.name || '')

    if (!datum.name) {
      throw new Error('“' + datum.short_name + '” doesn’t have a name')
    }

    datum.emoticons = datum.texts || []
    datum.text = datum.text || ''
    delete datum.texts

    if (emojiLibBySlug[datum.short_name]) {
      datum.keywords = emojiLibBySlug[datum.short_name].keywords
    }

    if (datum.category != 'Skin Tones' && datum.category != 'Component') {
      categoryIndex = categoriesIndex[category]
      data.categories[categoryIndex].emojis.push(datum.short_name)
      data.emojis[datum.short_name] = datum
    }

    datum.short_names.forEach((short_name, i) => {
      if (i == 0) {
        return
      }

      data.aliases[short_name] = datum.short_name
    })

    delete datum.docomo
    delete datum.au
    delete datum.softbank
    delete datum.google
    delete datum.image
    delete datum.category
    delete datum.sort_order

    compress(datum)
  })

  var flags = data.categories[categoriesIndex['Flags']]
  flags.emojis = flags.emojis
    .filter((flag) => {
      // Until browsers support Flag UN
      if (flag == 'flag-un') return
      return true
    })
    .sort()

  // Merge “Smileys & Emotion” and “People & Body” into a single category
  let smileys = data.categories[0]
  let people = data.categories[1]
  let smileysAndPeople = { id: 'people', name: 'Smileys & People' }
  smileysAndPeople.emojis = []
    .concat(smileys.emojis.slice(0, 114))
    .concat(people.emojis)
    .concat(smileys.emojis.slice(114))

  data.categories.unshift(smileysAndPeople)
  data.categories.splice(1, 2)

  fs.writeFile(options.output, JSON.stringify(data), (err) => {
    if (err) throw err
  })
}

function selectEmojisBySlug(keywordSet, data) {
  // conversion from v2 to v3 as described in https://github.com/muan/emojilib#migrating-from-2x
  for (const emoji in data) {
    data[emoji]['keywords'] = keywordSet[emoji]
  }

  return keyBy(data, 'slug')
}
