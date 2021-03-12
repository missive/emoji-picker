import { getData, getSanitizedData, intersect } from '..'
import { uncompress } from '../data'
import store from '../store'

export default class NimbleEmojiIndex {
  constructor(data, set, prebuiltIndex) {
    if (data.compressed) {
      uncompress(data)
    }

    if (prebuiltIndex !== undefined) {
      this.data = prebuiltIndex.data
      this.set = prebuiltIndex.set
      this.originalPool = prebuiltIndex.originalPool
      this.index = prebuiltIndex.index
      this.emojis = prebuiltIndex.emojis
      this.emoticons = prebuiltIndex.emoticons
      this.customEmojisList = prebuiltIndex.customEmojisList
    } else {
      this.data = data || {}
      this.set = set || null
      this.originalPool = {}
      this.index = {}
      this.emojis = {}
      this.emoticons = {}
      this.customEmojisList = []
      this.buildIndex()
    }
  }

  buildIndex() {
    for (let emoji in this.data.emojis) {
      let emojiData = this.data.emojis[emoji],
        { short_names, emoticons, skin_variations } = emojiData,
        id = short_names[0]

      if (emoticons) {
        emoticons.forEach((emoticon) => {
          if (this.emoticons[emoticon]) {
            return
          }

          this.emoticons[emoticon] = id
        })
      }

      // If skin variations include them
      if (skin_variations) {
        this.emojis[id] = {}
        for (let skinTone = 1; skinTone <= 6; skinTone++) {
          this.emojis[id][skinTone] = getSanitizedData(
            { id, skin: skinTone },
            skinTone,
            this.set,
            this.data,
          )
        }
      } else {
        this.emojis[id] = getSanitizedData(id, null, this.set, this.data)
      }

      this.originalPool[id] = emojiData
    }
  }

  clearCustomEmojis(pool) {
    this.customEmojisList.forEach((emoji) => {
      let emojiId = emoji.id || emoji.short_names[0]

      delete pool[emojiId]
      delete this.emojis[emojiId]
    })
  }

  addCustomToPool(custom, pool) {
    if (this.customEmojisList.length) this.clearCustomEmojis(pool)

    custom.forEach((emoji) => {
      let emojiId = emoji.id || emoji.short_names[0]

      if (emojiId && !pool[emojiId]) {
        pool[emojiId] = getData(emoji, null, null, this.data)
        this.emojis[emojiId] = getSanitizedData(emoji, null, null, this.data)
      }
    })

    this.customEmojisList = custom
    this.index = {}
  }

  search(
    value,
    { emojisToShowFilter, maxResults, include, exclude, custom = [] } = {},
  ) {
    if (this.customEmojisList != custom)
      this.addCustomToPool(custom, this.originalPool)

    const skinTone = store.get('skin') || 1

    maxResults || (maxResults = 75)
    include || (include = [])
    exclude || (exclude = [])

    var results = null,
      pool = this.originalPool

    if (value.length) {
      if (value == '-' || value == '-1') {
        return [this.emojis['-1'][skinTone]]
      }

      var values = value.toLowerCase().split(/[\s|,|\-|_]+/),
        allResults = []

      if (values.length > 2) {
        values = [values[0], values[1]]
      }

      if (include.length || exclude.length) {
        pool = {}

        this.data.categories.forEach((category) => {
          let isIncluded =
            include && include.length ? include.indexOf(category.id) > -1 : true
          let isExcluded =
            exclude && exclude.length
              ? exclude.indexOf(category.id) > -1
              : false
          if (!isIncluded || isExcluded) {
            return
          }

          category.emojis.forEach(
            (emojiId) => (pool[emojiId] = this.data.emojis[emojiId]),
          )
        })

        if (custom.length) {
          let customIsIncluded =
            include && include.length ? include.indexOf('custom') > -1 : true
          let customIsExcluded =
            exclude && exclude.length ? exclude.indexOf('custom') > -1 : false
          if (customIsIncluded && !customIsExcluded) {
            this.addCustomToPool(custom, pool)
          }
        }
      }

      allResults = values
        .map((value) => {
          var aPool = pool,
            aIndex = this.index,
            length = 0

          for (let charIndex = 0; charIndex < value.length; charIndex++) {
            const char = value[charIndex]
            length++

            aIndex[char] || (aIndex[char] = {})
            aIndex = aIndex[char]

            if (!aIndex.results) {
              let scores = {}

              aIndex.results = []
              aIndex.pool = {}

              for (let id in aPool) {
                let emoji = aPool[id],
                  { search } = emoji,
                  sub = value.substr(0, length),
                  subIndex = search.indexOf(sub)

                if (subIndex != -1) {
                  let score = subIndex + 1
                  if (sub == id) score = 0

                  if (this.emojis[id] && this.emojis[id][skinTone]) {
                    aIndex.results.push(this.emojis[id][skinTone])
                  } else {
                    aIndex.results.push(this.emojis[id])
                  }
                  aIndex.pool[id] = emoji

                  scores[id] = score
                }
              }

              aIndex.results.sort((a, b) => {
                var aScore = scores[a.id],
                  bScore = scores[b.id]

                if (aScore == bScore) {
                  return a.id.localeCompare(b.id)
                } else {
                  return aScore - bScore
                }
              })
            }

            aPool = aIndex.pool
          }

          return aIndex.results
        })
        .filter((a) => a)

      if (allResults.length > 1) {
        results = intersect.apply(null, allResults)
      } else if (allResults.length) {
        results = allResults[0]
      } else {
        results = []
      }
    }

    if (results) {
      if (emojisToShowFilter) {
        results = results.filter((result) =>
          emojisToShowFilter(pool[result.id]),
        )
      }

      if (results && results.length > maxResults) {
        results = results.slice(0, maxResults)
      }
    }

    return results
  }

  printIndex() {
    console.log(JSON.stringify({
      data: this.data,
      set: this.set,
      originalPool: this.originalPool,
      index: this.index,
      emojis: this.emojis,
      emoticons: this.emoticons,
      customEmojisList: this.customEmojisList,
    }));
  }
}
