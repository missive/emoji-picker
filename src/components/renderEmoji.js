import React from 'react'
import NimbleEmoji from './emoji/nimble-emoji'

export default ({
  i18n,
  perLine = 9,
  emojis = [],
  emojiProps,
  data,
  activeCategory,
}) => {
  const Emoji = ({ style, rowIndex, columnIndex }) => {
    const currentIndex = perLine * rowIndex + columnIndex
    const emoji = emojis[currentIndex] || null

    if (!emoji) return null

    const isCat = emoji.cat_id
    const renderLabel = () => {
      if (!emoji.cat_id) return null

      const label = i18n.categories[emoji.cat_id] || emoji.cat_name

      let labelSpanStyles = {}

      if (activeCategory.id !== emoji.cat_id) {
        labelSpanStyles = {
          position: 'absolute',
        }
      }

      return (
        <div
          style={{
            ...style,
            width: '100%',
          }}
          data-name={label}
          className="emoji-mart-category-label"
        >
          <span
            style={labelSpanStyles}
            aria-hidden={true /* already labeled by the section aria-label */}
          >
            {label}
          </span>
        </div>
      )
    }

    return isCat ? (
      renderLabel()
    ) : (
      <li
        style={style}
        key={(emoji.short_names && emoji.short_names.join('_')) || emoji}
      >
        {NimbleEmoji({ emoji: emoji, data: data, ...emojiProps })}
      </li>
    )
  }

  return Emoji
}
