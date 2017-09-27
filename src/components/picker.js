import '../vendor/raf-polyfill'

import React from 'react'
import PropTypes from 'prop-types'
import measureScrollbar from 'measure-scrollbar'
import data from '../../data'

import store from '../utils/store'
import frequently from '../utils/frequently'
import { deepMerge } from '../utils'

import { Anchors, Category, Emoji, Preview, Search } from '.'

const RECENT_CATEGORY = { name: 'Recent', emojis: null }
const SEARCH_CATEGORY = { name: 'Search', emojis: null, anchor: false }
const CUSTOM_CATEGORY = { name: 'Custom', emojis: [] }

const I18N = {
  search: 'Search',
  notfound: 'No Emoji Found',
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
}

export default class Picker extends React.Component {
  constructor(props) {
    super(props)

    this.i18n = deepMerge(I18N, props.i18n)
    this.state = {
      skin: store.get('skin') || props.skin,
      firstRender: true,
    }

    this.categories = []
    let allCategories = [].concat(data.categories)

    if (props.custom.length > 0) {
      CUSTOM_CATEGORY.emojis = props.custom.map(emoji => {
        return {
          ...emoji,
          // `<Category />` expects emoji to have an `id`.
          id: emoji.short_names[0],
          custom: true,
        }
      })

      allCategories.push(CUSTOM_CATEGORY)
    }

    this.hideRecent = true

    if (props.include != undefined) {
      data.categories.sort((a, b) => {
        let aName = a.name.toLowerCase()
        let bName = b.name.toLowerCase()

        if (props.include.indexOf(aName) > props.include.indexOf(bName)) {
          return 1
        }

        return 0
      })
    }

    for (let categoryIndex = 0; categoryIndex < allCategories.length; categoryIndex++) {
      const category = allCategories[categoryIndex]
      let isIncluded = props.include && props.include.length ? props.include.indexOf(category.name.toLowerCase()) > -1 : true
      let isExcluded = props.exclude && props.exclude.length ? props.exclude.indexOf(category.name.toLowerCase()) > -1 : false
      if (!isIncluded || isExcluded) { continue }

      if (props.emojisToShowFilter) {
        let newEmojis = []

        const {emojis} = category
        for (let emojiIndex = 0; emojiIndex < emojis.length; emojiIndex++) {
          const emoji = emojis[emojiIndex]
          if (props.emojisToShowFilter(data.emojis[emoji] || emoji)) {
            newEmojis.push(emoji)
          }
        }

        if (newEmojis.length) {
          let newCategory = {
            emojis: newEmojis,
            name: category.name,
          }

          this.categories.push(newCategory)
        }
      } else {
        this.categories.push(category)
      }
    }

    let includeRecent = props.include && props.include.length ? props.include.indexOf('recent') > -1 : true
    let excludeRecent = props.exclude && props.exclude.length ? props.exclude.indexOf('recent') > -1 : false
    if (includeRecent && !excludeRecent) {
      this.hideRecent = false
      this.categories.unshift(RECENT_CATEGORY)
    }

    if (this.categories[0]) {
      this.categories[0].first = true
    }

    this.categories.unshift(SEARCH_CATEGORY)
  }

  componentWillReceiveProps(props) {
    if (props.skin && !store.get('skin')) {
      this.setState({ skin: props.skin })
    }
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
    SEARCH_CATEGORY.emojis = null

    clearTimeout(this.leaveTimeout)
    clearTimeout(this.firstRenderTimeout)
  }

  testStickyPosition() {
    const stickyTestElement = document.createElement('div')

    const prefixes = ['', '-webkit-', '-ms-', '-moz-', '-o-']

    prefixes.forEach(prefix => stickyTestElement.style.position = `${prefix}sticky`)

    this.hasStickyPosition = !!stickyTestElement.style.position.length
  }

  handleEmojiOver(emoji) {
    var { preview } = this.refs
    // Use Array.prototype.find() when it is more widely supported.
    const emojiData = CUSTOM_CATEGORY.emojis.filter(customEmoji => customEmoji.id === emoji.id)[0]
    for (let key in emojiData) {
      if (emojiData.hasOwnProperty(key)) {
          emoji[key] = emojiData[key]
      }
    }
    preview.setState({ emoji })
    clearTimeout(this.leaveTimeout)
  }

  handleEmojiLeave(emoji) {
    this.leaveTimeout = setTimeout(() => {
      var { preview } = this.refs
      preview.setState({ emoji: null })
    }, 16)
  }

  handleEmojiClick(emoji, e) {
    this.props.onClick(emoji, e)
    if (!this.hideRecent) frequently.add(emoji)

    var component = this.refs['category-1']
    if (component) {
      let maxMargin = component.maxMargin
      component.forceUpdate()

      window.requestAnimationFrame(() => {
        component.memoizeSize()
        if (maxMargin == component.maxMargin) return

        this.updateCategoriesSize()
        this.handleScrollPaint()

        if (SEARCH_CATEGORY.emojis) {
          component.updateDisplay('none')
        }
      })
    }
  }

  handleScroll() {
    if (!this.waitingForPaint) {
      this.waitingForPaint = true
      window.requestAnimationFrame(this.handleScrollPaint.bind(this))
    }
  }

  handleScrollPaint() {
    this.waitingForPaint = false

    if (!this.refs.scroll) {
      return
    }

    let activeCategory = null

    if (SEARCH_CATEGORY.emojis) {
      activeCategory = SEARCH_CATEGORY
    } else {
      var target = this.refs.scroll,
          scrollTop = target.scrollTop,
          scrollingDown = scrollTop > (this.scrollTop || 0),
          minTop = 0

      for (let i = 0, l = this.categories.length; i < l; i++) {
        let ii = scrollingDown ? (this.categories.length - 1 - i) : i,
            category = this.categories[ii],
            component = this.refs[`category-${ii}`]

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
        activeCategory = this.categories.filter(category => !(category.anchor === false))[0]
      } else if (scrollTop + this.clientHeight >= this.scrollHeight) {
        activeCategory = this.categories[this.categories.length - 1]
      }
    }

    if (activeCategory) {
      let { anchors } = this.refs,
          { name: categoryName } = activeCategory

      if (anchors.state.selected != categoryName) {
        anchors.setState({ selected: categoryName })
      }
    }

    this.scrollTop = scrollTop
  }

  handleSearch(emojis) {
    SEARCH_CATEGORY.emojis = emojis

    for (let i = 0, l = this.categories.length; i < l; i++) {
      let component = this.refs[`category-${i}`]

      if (component && component.props.name != 'Search') {
        let display = emojis ? 'none' : 'inherit'
        component.updateDisplay(display)
      }
    }

    this.forceUpdate()
    this.refs.scroll.scrollTop = 0
    this.handleScroll()
  }

  handleAnchorClick(category, i) {
    var component = this.refs[`category-${i}`],
        { scroll, anchors } = this.refs,
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

    if (SEARCH_CATEGORY.emojis) {
      this.handleSearch(null)
      this.refs.search.clear()

      window.requestAnimationFrame(scrollToComponent)
    } else {
      scrollToComponent()
    }
  }

  handleSkinChange(skin) {
    var newState = { skin: skin }

    this.setState(newState)
    store.update(newState)
  }

  updateCategoriesSize() {
    for (let i = 0, l = this.categories.length; i < l; i++) {
      let component = this.refs[`category-${i}`]
      if (component) component.memoizeSize()
    }

    if (this.refs.scroll) {
      let target = this.refs.scroll
      this.scrollHeight = target.scrollHeight
      this.clientHeight = target.clientHeight
    }
  }

  getCategories() {
    return this.state.firstRender ? this.categories.slice(0, 3) : this.categories
  }

  render() {
    var { perLine, emojiSize, set, sheetSize, style, title, emoji, color, native, backgroundImageFn, emojisToShowFilter, include, exclude, autoFocus, defaultValue } = this.props,
        { skin } = this.state,
        width = (perLine * (emojiSize + 12)) + 12 + 2 + measureScrollbar()

    return <div style={{width: width, ...style}} className='emoji-mart'>
      <div className='emoji-mart-bar'>
        <Anchors
          ref='anchors'
          i18n={this.i18n}
          color={color}
          categories={this.categories}
          onAnchorClick={this.handleAnchorClick.bind(this)}
        />
      </div>

      {/* don't render Search until Categories are rendered and searchable */}
      {this.state.firstRender ? null :
        <Search
          ref='search'
          onSearch={this.handleSearch.bind(this)}
          i18n={this.i18n}
          emojisToShowFilter={emojisToShowFilter}
          include={include}
          exclude={exclude}
          custom={CUSTOM_CATEGORY.emojis}
          autoFocus={autoFocus}
          defaultValue={this.state.firstRender ? undefined : defaultValue}
        />
      }

      <div ref="scroll" className='emoji-mart-scroll' onScroll={this.handleScroll.bind(this)}>
        {this.getCategories().map((category, i) => {
          return <Category
            ref={`category-${i}`}
            key={category.name}
            name={category.name}
            emojis={category.emojis}
            perLine={perLine}
            native={native}
            hasStickyPosition={this.hasStickyPosition}
            i18n={this.i18n}
            custom={category.name == 'Recent' ? CUSTOM_CATEGORY.emojis : undefined}
            emojiProps={{
              native: native,
              skin: skin,
              size: emojiSize,
              set: set,
              sheetSize: sheetSize,
              forceSize: native,
              backgroundImageFn: backgroundImageFn,
              onOver: this.handleEmojiOver.bind(this),
              onLeave: this.handleEmojiLeave.bind(this),
              onClick: this.handleEmojiClick.bind(this),
            }}
          />
        })}
      </div>

      <div className='emoji-mart-bar'>
        <Preview
          ref='preview'
          title={title}
          emoji={emoji}
          emojiProps={{
            native: native,
            size: 38,
            skin: skin,
            set: set,
            sheetSize: sheetSize,
            backgroundImageFn: backgroundImageFn,
          }}
          skinsProps={{
            skin: skin,
            onChange: this.handleSkinChange.bind(this)
          }}
        />
      </div>
    </div>
  }
}

Picker.propTypes = {
  onClick: PropTypes.func,
  perLine: PropTypes.number,
  emojiSize: PropTypes.number,
  i18n: PropTypes.object,
  style: PropTypes.object,
  title: PropTypes.string,
  emoji: PropTypes.string,
  color: PropTypes.string,
  set: Emoji.propTypes.set,
  skin: Emoji.propTypes.skin,
  native: PropTypes.bool,
  backgroundImageFn: Emoji.propTypes.backgroundImageFn,
  sheetSize: Emoji.propTypes.sheetSize,
  emojisToShowFilter: PropTypes.func,
  include: PropTypes.arrayOf(PropTypes.string),
  exclude: PropTypes.arrayOf(PropTypes.string),
  autoFocus: PropTypes.bool,
  defaultValue: PropTypes.string,
  custom: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    short_names: PropTypes.arrayOf(PropTypes.string).isRequired,
    emoticons: PropTypes.arrayOf(PropTypes.string),
    keywords: PropTypes.arrayOf(PropTypes.string),
    imageUrl: PropTypes.string.isRequired,
  })),
}

Picker.defaultProps = {
  onClick: (() => {}),
  emojiSize: 24,
  perLine: 9,
  i18n: {},
  style: {},
  title: 'Emoji Mart™',
  emoji: 'department_store',
  color: '#ae65c5',
  set: Emoji.defaultProps.set,
  skin: Emoji.defaultProps.skin,
  native: Emoji.defaultProps.native,
  sheetSize: Emoji.defaultProps.sheetSize,
  backgroundImageFn: Emoji.defaultProps.backgroundImageFn,
  emojisToShowFilter: null,
  autoFocus: false,
  custom: [],
}
