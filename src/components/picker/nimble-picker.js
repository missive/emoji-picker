import React from 'react'
import PropTypes from 'prop-types'

import * as icons from '../../svgs'
import store from '../../utils/store'
import frequently from '../../utils/frequently'
import { deepMerge, measureScrollbar, getSanitizedData } from '../../utils'
import { uncompress } from '../../utils/data'
import { PickerPropTypes } from '../../utils/shared-props'

import Anchors from '../anchors'
import Category from '../category'
import Preview from '../preview'
import Search from '../search'
import { PickerDefaultProps } from '../../utils/shared-default-props'

const I18N = {
  search: 'Search',
  clear: 'Clear', // Accessible label on "clear" button
  notfound: 'No Emoji Found',
  skintext: 'Choose your default skin tone',
  categories: {
    search: 'Search Results',
    recent: 'Frequently Used',
    people: 'Smileys & People',
    nature: 'Animals & Nature',
    foods: 'Food & Drink',
    activity: 'Activity',
    places: 'Travel & Places',
    objects: 'Objects',
    symbols: 'Symbols',
    flags: 'Flags',
    custom: 'Custom',
  },
  categorieslabel: 'Emoji categories', // Accessible title for the list of categories
  skintones: {
    1: 'Default Skin Tone',
    2: 'Light Skin Tone',
    3: 'Medium-Light Skin Tone',
    4: 'Medium Skin Tone',
    5: 'Medium-Dark Skin Tone',
    6: 'Dark Skin Tone',
  },
}

class NimblePicker extends React.PureComponent {
  constructor(props) {
    super(props)

    this.CUSTOM = []

    this.RECENT_CATEGORY = { id: 'recent', name: 'Recent', emojis: null }
    this.SEARCH_CATEGORY = {
      id: 'search',
      name: 'Search',
      emojis: null,
      anchor: false,
    }

    if (props.data.compressed) {
      uncompress(props.data)
    }

    this.data = props.data
    this.i18n = deepMerge(I18N, props.i18n)
    this.icons = deepMerge(icons, props.icons)
    this.state = { firstRender: true, emoji: null }

    this.categories = []
    let allCategories = [].concat(this.data.categories)

    if (props.custom.length > 0) {
      const customCategories = {}
      let customCategoriesCreated = 0

      props.custom.forEach((emoji) => {
        if (!customCategories[emoji.customCategory]) {
          customCategories[emoji.customCategory] = {
            id: emoji.customCategory
              ? `custom-${emoji.customCategory}`
              : 'custom',
            name: emoji.customCategory || 'Custom',
            emojis: [],
            anchor: customCategoriesCreated === 0,
          }

          customCategoriesCreated++
        }

        const category = customCategories[emoji.customCategory]

        const customEmoji = {
          ...emoji,
          // `<Category />` expects emoji to have an `id`.
          id: emoji.short_names[0],
          custom: true,
        }

        category.emojis.push(customEmoji)
        this.CUSTOM.push(customEmoji)
      })

      allCategories = allCategories.concat(
        Object.keys(customCategories).map((key) => customCategories[key]),
      )
    }

    this.hideRecent = true

    if (props.include != undefined) {
      allCategories.sort((a, b) => {
        if (props.include.indexOf(a.id) > props.include.indexOf(b.id)) {
          return 1
        }

        return -1
      })
    }

    for (
      let categoryIndex = 0;
      categoryIndex < allCategories.length;
      categoryIndex++
    ) {
      const category = allCategories[categoryIndex]
      let isIncluded =
        props.include && props.include.length
          ? props.include.indexOf(category.id) > -1
          : true
      let isExcluded =
        props.exclude && props.exclude.length
          ? props.exclude.indexOf(category.id) > -1
          : false
      if (!isIncluded || isExcluded) {
        continue
      }

      if (props.emojisToShowFilter) {
        let newEmojis = []

        const { emojis } = category
        for (let emojiIndex = 0; emojiIndex < emojis.length; emojiIndex++) {
          const emoji = emojis[emojiIndex]
          if (props.emojisToShowFilter(this.data.emojis[emoji] || emoji)) {
            newEmojis.push(emoji)
          }
        }

        if (newEmojis.length) {
          let newCategory = {
            emojis: newEmojis,
            name: category.name,
            id: category.id,
          }

          this.categories.push(newCategory)
        }
      } else {
        this.categories.push(category)
      }
    }

    let includeRecent =
      props.include && props.include.length
        ? props.include.indexOf(this.RECENT_CATEGORY.id) > -1
        : true
    let excludeRecent =
      props.exclude && props.exclude.length
        ? props.exclude.indexOf(this.RECENT_CATEGORY.id) > -1
        : false
    if (includeRecent && !excludeRecent) {
      this.hideRecent = false
      this.categories.unshift(this.RECENT_CATEGORY)
    }

    if (this.categories[0]) {
      this.categories[0].first = true
    }

    this.categories.unshift(this.SEARCH_CATEGORY)
    this.getEmojiIndex = this.getEmojiIndex.bind(this)
    this.getEmojiElement = this.getEmojiElement.bind(this)
    this.getEmojiToPreview = this.getEmojiToPreview.bind(this)
    this.getEmojisInCategory = this.getEmojisInCategory.bind(this)
    this.setAnchorsRef = this.setAnchorsRef.bind(this)
    this.handleAnchorClick = this.handleAnchorClick.bind(this)
    this.setSearchRef = this.setSearchRef.bind(this)
    this.handleSearch = this.handleSearch.bind(this)
    this.setScrollRef = this.setScrollRef.bind(this)
    this.handleScroll = this.handleScroll.bind(this)
    this.handleScrollPaint = this.handleScrollPaint.bind(this)
    this.handleEmojiOver = this.handleEmojiOver.bind(this)
    this.handleEmojiLeave = this.handleEmojiLeave.bind(this)
    this.handleEmojiClick = this.handleEmojiClick.bind(this)
    this.handleEmojiSelect = this.handleEmojiSelect.bind(this)
    this.handleEmojiKeyDown = this.handleEmojiKeyDown.bind(this)
    this.setPreviewRef = this.setPreviewRef.bind(this)
    this.handleSkinChange = this.handleSkinChange.bind(this)
    this.handleKeyDown = this.handleKeyDown.bind(this)
    this.handleDarkMatchMediaChange = this.handleDarkMatchMediaChange.bind(this)
  }

  componentDidMount() {
    if (this.state.firstRender) {
      this.testStickyPosition()
      this.firstRenderTimeout = setTimeout(() => {
        this.setState({ firstRender: false })
      }, 60)
    }
  }

  componentDidUpdate() {
    this.updateCategoriesSize()
    this.handleScroll()
  }

  componentWillUnmount() {
    this.SEARCH_CATEGORY.emojis = null

    clearTimeout(this.leaveTimeout)
    clearTimeout(this.firstRenderTimeout)

    if (this.darkMatchMedia) {
      this.darkMatchMedia.removeListener(this.handleDarkMatchMediaChange)
    }
  }

  testStickyPosition() {
    const stickyTestElement = document.createElement('div')

    const prefixes = ['', '-webkit-', '-ms-', '-moz-', '-o-']

    prefixes.forEach(
      (prefix) => (stickyTestElement.style.position = `${prefix}sticky`),
    )

    this.hasStickyPosition = !!stickyTestElement.style.position.length
  }

  getPreferredTheme() {
    if (this.props.theme != 'auto') return this.props.theme
    if (this.state.theme) return this.state.theme
    if (typeof matchMedia !== 'function') return PickerDefaultProps.theme

    if (!this.darkMatchMedia) {
      this.darkMatchMedia = matchMedia('(prefers-color-scheme: dark)')
      this.darkMatchMedia.addListener(this.handleDarkMatchMediaChange)
    }

    if (this.darkMatchMedia.media.match(/^not/)) return PickerDefaultProps.theme
    return this.darkMatchMedia.matches ? 'dark' : 'light'
  }

  getEmojiElement(categoryIndex, emojiIndex) {
    const categoryRef = this.categoryRefs[`category-${categoryIndex}`]
    const cells = categoryRef.emojiTableRef.querySelectorAll('button')
    return cells[emojiIndex]
  }

  getEmojiToPreview(categoryIndex, emojiIndex) {
    const emojis = this.getEmojisInCategory(categoryIndex)
    const emoji = emojis[emojiIndex]

    const emojiToPreview = getSanitizedData(
      emoji,
      this.state.skin,
      this.props.set,
      this.props.data,
    )

    var { preview } = this
    if (!preview) {
      return
    }

    const emojiData = this.CUSTOM.filter(
      (customEmoji) => customEmoji.id === emojiToPreview.id,
    )[0]

    for (let key in emojiData) {
      if (emojiData.hasOwnProperty(key)) {
        emoji[key] = emojiData[key]
      }
    }

    this.setState({ emoji: emojiToPreview })
  }

  getEmojisInCategory(categoryIndex) {
    return categoryIndex === 1
      ? frequently.get(this.props.perLine)
      : this.categories[categoryIndex].emojis
  }
  getEmojiIndex(row, column) {
    const { perLine } = this.props
    return row * perLine + column
  }

  handleDarkMatchMediaChange() {
    this.setState({ theme: this.darkMatchMedia.matches ? 'dark' : 'light' })
  }

  handleEmojiOver(emoji) {
    var { preview } = this
    if (!preview) {
      return
    }

    // Use Array.prototype.find() when it is more widely supported.
    const emojiData = this.CUSTOM.filter(
      (customEmoji) => customEmoji.id === emoji.id,
    )[0]
    for (let key in emojiData) {
      if (emojiData.hasOwnProperty(key)) {
        emoji[key] = emojiData[key]
      }
    }

    this.setState({ emoji })
    clearTimeout(this.leaveTimeout)
  }

  handleEmojiLeave(emoji) {
    var { preview } = this
    if (!preview) {
      return
    }

    this.leaveTimeout = setTimeout(() => {
      this.setState({ emoji: null })
    }, 16)
  }

  handleEmojiKeyDown(e, currentEmoji, { category, row, column }) {
    const { perLine } = this.props
    const categoryIndex = this.categories.findIndex(({ id }) => id === category)

    const getLastEmojiIndex = (categoryIndex) => {
      const emojisInCategory = this.getEmojisInCategory(categoryIndex)
      const lastEmojiIndex = emojisInCategory.length - 1
      return lastEmojiIndex
    }

    let newRow
    let newColumn
    let newCategoryIndex = categoryIndex
    let emojiIndex
    const lastEmojiIndex = getLastEmojiIndex(categoryIndex)

    switch (e.key) {
      case 'Enter':
        this.handleEmojiSelect(currentEmoji)
        e.stopPropagation()
        return

      case 'Tab':
        // Focus on first category anchor
        this.anchors.buttons.firstChild.focus()
        this.setState({ emoji: null })
        return

      case 'ArrowLeft':
        newRow = row
        newColumn = column - 1
        // Get Emoji at (row, column - 1) or (row - 1, lastColumn)
        emojiIndex = this.getEmojiIndex(newRow, newColumn)
        if (emojiIndex < 0) {
          newCategoryIndex = categoryIndex - 1
          if (newCategoryIndex < 1) {
            return
          }
          // Get last Emoji in previous category
          emojiIndex = getLastEmojiIndex(newCategoryIndex)
        }
        break

      case 'ArrowUp':
        newRow = row - 1
        newColumn = column
        // Get Emoji at (row - 1, column)
        emojiIndex = this.getEmojiIndex(newRow, newColumn)
        if (emojiIndex < 0) {
          newCategoryIndex = categoryIndex - 1
          if (newCategoryIndex < 1) {
            return
          }
          let numOfItemsOnLastRow =
            this.getEmojisInCategory(newCategoryIndex).length % perLine

          if (numOfItemsOnLastRow === 0) {
            // If last row of previous category is full
            // Get Emoji in previous category at (lastRow, column)
            newRow =
              Math.floor(
                this.getEmojisInCategory(newCategoryIndex).length / perLine,
              ) - 1
            emojiIndex = this.getEmojiIndex(newRow, newColumn)
          } else if (newColumn >= numOfItemsOnLastRow) {
            // If last row of previous category doesn't have items above current item
            // Get last Emoji in previous category
            emojiIndex = getLastEmojiIndex(newCategoryIndex)
          } else {
            // If last row of previous category has items above current item
            // Get Emoji in previous category at (lastRow, column)
            newRow = Math.floor(
              this.getEmojisInCategory(newCategoryIndex).length / perLine,
            )
            emojiIndex = this.getEmojiIndex(newRow, newColumn)
          }
        }
        break

      case 'ArrowRight':
        newRow = row
        newColumn = column + 1
        // Get Emoji at (row, column + 1) or on (row + 1, 0)
        emojiIndex = this.getEmojiIndex(newRow, newColumn)
        if (emojiIndex > lastEmojiIndex) {
          newCategoryIndex = categoryIndex + 1
          if (newCategoryIndex >= this.categories.length) {
            return
          }
          // Get first Emoji in next category
          emojiIndex = 0
        }
        break

      case 'ArrowDown':
        newRow = row + 1
        newColumn = column
        // Get Emoji at (row + 1, column)
        emojiIndex = this.getEmojiIndex(newRow, newColumn)
        if (emojiIndex > lastEmojiIndex) {
          newCategoryIndex = categoryIndex + 1
          if (newCategoryIndex >= this.categories.length) {
            return
          }
          // Get Emoji in next category at (0, column)
          emojiIndex = this.getEmojiIndex(0, newColumn)
        }
        break
      default:
        return
    }

    e.preventDefault()
    e.stopPropagation()

    const emojiEl = this.getEmojiElement(newCategoryIndex, emojiIndex)
    emojiEl.focus()
    this.getEmojiToPreview(newCategoryIndex, emojiIndex)
    clearTimeout(this.leaveTimeout)
  }

  handleEmojiClick(emoji, e) {
    this.props.onClick(emoji, e)
    this.handleEmojiSelect(emoji)
  }

  handleEmojiSelect(emoji) {
    this.props.onSelect(emoji)
    if (!this.hideRecent && !this.props.recent) frequently.add(emoji)

    var component = this.categoryRefs['category-1']
    if (component) {
      let maxMargin = component.maxMargin
      if (this.props.enableFrequentEmojiSort) {
        component.forceUpdate()
      }

      requestAnimationFrame(() => {
        if (!this.scroll) return
        component.memoizeSize()
        if (maxMargin == component.maxMargin) return

        this.updateCategoriesSize()
        this.handleScrollPaint()

        if (this.SEARCH_CATEGORY.emojis) {
          component.updateDisplay('none')
        }
      })
    }
  }

  handleScroll() {
    if (!this.waitingForPaint) {
      this.waitingForPaint = true
      requestAnimationFrame(this.handleScrollPaint)
    }
  }

  handleScrollPaint() {
    this.waitingForPaint = false

    if (!this.scroll) {
      return
    }

    let activeCategory = null

    if (this.SEARCH_CATEGORY.emojis) {
      activeCategory = this.SEARCH_CATEGORY
    } else {
      var target = this.scroll,
        scrollTop = target.scrollTop,
        scrollingDown = scrollTop > (this.scrollTop || 0),
        minTop = 0

      for (let i = 0, l = this.categories.length; i < l; i++) {
        let ii = scrollingDown ? this.categories.length - 1 - i : i,
          category = this.categories[ii],
          component = this.categoryRefs[`category-${ii}`]

        if (component) {
          let active = component.handleScroll(scrollTop)

          if (!minTop || component.top < minTop) {
            if (component.top > 0) {
              minTop = component.top
            }
          }

          if (active && !activeCategory) {
            activeCategory = category
          }
        }
      }

      if (scrollTop < minTop) {
        activeCategory = this.categories.filter(
          (category) => !(category.anchor === false),
        )[0]
      } else if (scrollTop + this.clientHeight >= this.scrollHeight) {
        activeCategory = this.categories[this.categories.length - 1]
      }
    }

    if (activeCategory) {
      let { anchors } = this,
        { name: categoryName } = activeCategory

      if (anchors.state.selected != categoryName) {
        anchors.setState({ selected: categoryName })
      }
    }

    this.scrollTop = scrollTop
  }

  handleSearch(emojis) {
    this.SEARCH_CATEGORY.emojis = emojis

    for (let i = 0, l = this.categories.length; i < l; i++) {
      let component = this.categoryRefs[`category-${i}`]

      if (component && component.props.name != 'Search') {
        let display = emojis ? 'none' : 'inherit'
        component.updateDisplay(display)
      }
    }

    this.forceUpdate()
    if (this.scroll) {
      this.scroll.scrollTop = 0
    }
    this.handleScroll()
  }

  handleAnchorClick(category, i) {
    var component = this.categoryRefs[`category-${i}`],
      { scroll, anchors } = this,
      scrollToComponent = null

    scrollToComponent = () => {
      if (component) {
        let { top } = component

        if (category.first) {
          top = 0
        } else {
          top += 1
        }

        scroll.scrollTop = top
      }
    }

    if (this.SEARCH_CATEGORY.emojis) {
      this.handleSearch(null)
      this.search.clear()

      requestAnimationFrame(scrollToComponent)
    } else {
      scrollToComponent()
    }

    const emojiEl = this.getEmojiElement(i, 0)
    emojiEl.focus()
    this.getEmojiToPreview(i, 0)
  }

  handleSkinChange(skin) {
    var newState = { skin: skin },
      { onSkinChange } = this.props

    this.setState(newState)
    store.update(newState)

    onSkinChange(skin)
  }

  handleKeyDown(e) {
    let handled = false

    switch (e.key) {
      case 'Enter':
        if (this.SEARCH_CATEGORY.emojis && this.SEARCH_CATEGORY.emojis.length) {
          const emojiEl = this.getEmojiElement(0, 0)
          emojiEl.focus()
          this.getEmojiToPreview(0, 0)
          handled = true
        }
        break

      case 'Escape':
        // Jump to search text input
        this.search.input.focus()
        handled = true
        break

      case 'ArrowDown':
        const activeCategory = this.anchors.state.selected
        const activeCategoryIndex = this.categories.findIndex(
          ({ name }) => name === activeCategory,
        )
        const emojiEl = this.getEmojiElement(activeCategoryIndex, 0)
        emojiEl.focus()
        this.getEmojiToPreview(activeCategoryIndex, 0)
        handled = true
        break

      default:
        break
    }

    if (handled) {
      e.preventDefault()
      e.stopPropagation()
    }
  }

  updateCategoriesSize() {
    for (let i = 0, l = this.categories.length; i < l; i++) {
      let component = this.categoryRefs[`category-${i}`]
      if (component) component.memoizeSize()
    }

    if (this.scroll) {
      let target = this.scroll
      this.scrollHeight = target.scrollHeight
      this.clientHeight = target.clientHeight
    }
  }

  getCategories() {
    return this.state.firstRender
      ? this.categories.slice(0, 3)
      : this.categories
  }

  setAnchorsRef(c) {
    this.anchors = c
  }

  setSearchRef(c) {
    this.search = c
  }

  setPreviewRef(c) {
    this.preview = c
  }

  setScrollRef(c) {
    this.scroll = c
  }

  setCategoryRef(name, c) {
    if (!this.categoryRefs) {
      this.categoryRefs = {}
    }

    this.categoryRefs[name] = c
  }

  render() {
    var {
      perLine,
      emojiSize,
      set,
      sheetSize,
      sheetColumns,
      sheetRows,
      style,
      title,
      emoji: idleEmoji,
      color,
      native,
      backgroundImageFn,
      emojisToShowFilter,
      showPreview,
      showSkinTones,
      emojiTooltip,
      useButton,
      include,
      exclude,
      recent,
      autoFocus,
      skinEmoji,
      notFound,
      notFoundEmoji,
    } = this.props

    const { emoji } = this.state
    const pickerId = 'emoji-mart-picker'

    var width = perLine * (emojiSize + 12) + 12 + 2 + measureScrollbar()
    var theme = this.getPreferredTheme()
    var skin =
      this.props.skin ||
      this.state.skin ||
      store.get('skin') ||
      this.props.defaultSkin

    return (
      <section
        style={{ width: width, ...style }}
        className={`emoji-mart emoji-mart-${theme}`}
        aria-label={title}
        onKeyDown={this.handleKeyDown}
      >
        <div className="emoji-mart-bar">
          <Anchors
            ref={this.setAnchorsRef}
            data={this.data}
            i18n={this.i18n}
            color={color}
            categories={this.categories}
            onAnchorClick={this.handleAnchorClick}
            icons={this.icons}
          />
        </div>

        <Search
          ref={this.setSearchRef}
          onSearch={this.handleSearch}
          data={this.data}
          i18n={this.i18n}
          emojisToShowFilter={emojisToShowFilter}
          emoji={emoji}
          include={include}
          exclude={exclude}
          custom={this.CUSTOM}
          autoFocus={autoFocus}
          pickerId={pickerId}
        />

        <div
          id={pickerId}
          ref={this.setScrollRef}
          className="emoji-mart-scroll"
          onScroll={this.handleScroll}
        >
          {this.getCategories().map((category, i) => {
            return (
              <Category
                ref={this.setCategoryRef.bind(this, `category-${i}`)}
                key={category.name}
                id={category.id}
                name={category.name}
                emojis={category.emojis}
                perLine={perLine}
                native={native}
                hasStickyPosition={this.hasStickyPosition}
                data={this.data}
                i18n={this.i18n}
                recent={
                  category.id == this.RECENT_CATEGORY.id ? recent : undefined
                }
                custom={
                  category.id == this.RECENT_CATEGORY.id
                    ? this.CUSTOM
                    : undefined
                }
                emojiProps={{
                  native: native,
                  skin: skin,
                  size: emojiSize,
                  set: set,
                  sheetSize: sheetSize,
                  sheetColumns: sheetColumns,
                  sheetRows: sheetRows,
                  forceSize: native,
                  tooltip: emojiTooltip,
                  backgroundImageFn: backgroundImageFn,
                  useButton: useButton,
                  onOver: this.handleEmojiOver,
                  onLeave: this.handleEmojiLeave,
                  onClick: this.handleEmojiClick,
                  onKeyDown: this.handleEmojiKeyDown,
                }}
                notFound={notFound}
                notFoundEmoji={notFoundEmoji}
              />
            )
          })}
        </div>

        {(showPreview || showSkinTones) && (
          <div className="emoji-mart-bar">
            <Preview
              ref={this.setPreviewRef}
              data={this.data}
              title={title}
              emoji={emoji}
              idleEmoji={idleEmoji}
              onShowPreview={this.props.onShowPreview}
              onHidePreview={this.props.onHidePreview}
              showSkinTones={showSkinTones}
              showPreview={showPreview}
              emojiProps={{
                native: native,
                size: 38,
                skin: skin,
                set: set,
                sheetSize: sheetSize,
                sheetColumns: sheetColumns,
                sheetRows: sheetRows,
                backgroundImageFn: backgroundImageFn,
              }}
              skinsProps={{
                skin: skin,
                onChange: this.handleSkinChange,
                skinEmoji: skinEmoji,
              }}
              i18n={this.i18n}
            />
          </div>
        )}
      </section>
    )
  }
}

NimblePicker.propTypes /* remove-proptypes */ = {
  ...PickerPropTypes,
  data: PropTypes.object.isRequired,
}
NimblePicker.defaultProps = { ...PickerDefaultProps }

export default NimblePicker
