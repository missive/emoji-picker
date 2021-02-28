import React from 'react'
import PropTypes from 'prop-types'

import { getData, getSanitizedData, unifiedToNative } from '../../utils'
import { uncompress } from '../../utils/data'
import { EmojiPropTypes } from '../../utils/shared-props'
import { EmojiDefaultProps } from '../../utils/shared-default-props'

const _getData = (props) => {
  var { emoji, skin, set, data } = props
  return getData(emoji, skin, set, data)
}

const _getPosition = (props) => {
  var { sheet_x, sheet_y } = _getData(props),
    multiplyX = 100 / (props.sheetColumns - 1),
    multiplyY = 100 / (props.sheetRows - 1)

  return `${multiplyX * sheet_x}% ${multiplyY * sheet_y}%`
}

const _getSanitizedData = (props) => {
  var { emoji, skin, set, data } = props
  return getSanitizedData(emoji, skin, set, data)
}

const _handleClick = (e, props) => {
  if (!props.onClick) {
    return
  }
  var { onClick } = props,
    emoji = _getSanitizedData(props)

  onClick(emoji, e)
}

const _handleOver = (e, props) => {
  if (!props.onOver) {
    return
  }
  var { onOver } = props,
    emoji = _getSanitizedData(props)

  onOver(emoji, e)
}

const _handleLeave = (e, props) => {
  if (!props.onLeave) {
    return
  }
  var { onLeave } = props,
    emoji = _getSanitizedData(props)

  onLeave(emoji, e)
}

const _isNumeric = (value) => {
  return !isNaN(value - parseFloat(value))
}

const _convertStyleToCSS = (style) => {
  let div = document.createElement('div')

  for (let key in style) {
    let value = style[key]

    if (_isNumeric(value)) {
      value += 'px'
    }

    div.style[key] = value
  }

  return div.getAttribute('style')
}

const NimbleEmoji = (props) => {
  if (props.data.compressed) {
    uncompress(props.data)
  }

  for (let k in NimbleEmoji.defaultProps) {
    if (props[k] == undefined && NimbleEmoji.defaultProps[k] != undefined) {
      props[k] = NimbleEmoji.defaultProps[k]
    }
  }

  let data = _getData(props)
  if (!data) {
    if (props.fallback) {
      return props.fallback(null, props)
    } else {
      return null
    }
  }

  let { unified, custom, short_names, imageUrl } = data,
    style = {},
    children = props.children,
    className = 'emoji-mart-emoji',
    nativeEmoji = unified && unifiedToNative(unified),
    // combine the emoji itself and all shortcodes into an accessible label
    label = [nativeEmoji]
      .concat(short_names)
      .filter(Boolean)
      .join(', '),
    title = null

  if (!unified && !custom) {
    if (props.fallback) {
      return props.fallback(data, props)
    } else {
      return null
    }
  }

  if (props.tooltip) {
    title = short_names[0]
  }

  if (props.native && unified) {
    className += ' emoji-mart-emoji-native'
    style = { fontSize: props.size }
    children = nativeEmoji

    if (props.forceSize) {
      style.display = 'inline-block'
      style.width = props.size
      style.height = props.size
      style.wordBreak = 'keep-all'
    }
  } else if (custom) {
    className += ' emoji-mart-emoji-custom'
    style = {
      width: props.size,
      height: props.size,
      display: 'inline-block',
    }
    if (data.spriteUrl) {
      style = {
        ...style,
        backgroundImage: `url(${data.spriteUrl})`,
        backgroundSize: `${100 * props.sheetColumns}% ${100 *
          props.sheetRows}%`,
        backgroundPosition: _getPosition(props),
      }
    } else {
      style = {
        ...style,
        backgroundImage: `url(${imageUrl})`,
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
      }
    }
  } else {
    let setHasEmoji =
      data[`has_img_${props.set}`] == undefined || data[`has_img_${props.set}`]

    if (!setHasEmoji) {
      if (props.fallback) {
        return props.fallback(data, props)
      } else {
        return null
      }
    } else {
      style = {
        width: props.size,
        height: props.size,
        display: 'inline-block',
        backgroundImage: `url(${props.backgroundImageFn(
          props.set,
          props.sheetSize,
        )})`,
        backgroundSize: `${100 * props.sheetColumns}% ${100 *
          props.sheetRows}%`,
        backgroundPosition: _getPosition(props),
      }
    }
  }

  var Tag = {
    name: 'span',
    props: {},
  }

  if (props.onClick && props.useButton) {
    Tag.name = 'button'
    Tag.props = {
      type: 'button',
    }
  }

  if (props.html) {
    style = _convertStyleToCSS(style)
    return `<${Tag.name} style='${style}' aria-label='${label}' ${
      title ? `title='${title}'` : ''
    } class='${className}'>${children || ''}</${Tag.name}>`
  } else {
    return (
      <Tag.name
        onClick={(e) => _handleClick(e, props)}
        onMouseEnter={(e) => _handleOver(e, props)}
        onMouseLeave={(e) => _handleLeave(e, props)}
        aria-label={label}
        title={title}
        className={className}
        {...Tag.props}
      >
        <span style={style} className={data.className || ''}>
          {children}
        </span>
      </Tag.name>
    )
  }
}

NimbleEmoji.propTypes /* remove-proptypes */ = {
  ...EmojiPropTypes,
  data: PropTypes.object.isRequired,
}
NimbleEmoji.defaultProps = EmojiDefaultProps

export default NimbleEmoji
