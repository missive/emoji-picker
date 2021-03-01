import React from 'react'
import Emoji from './emoji'
import PropTypes from 'prop-types'

export default class Parser extends React.PureComponent {
  constructor(props) {
    super(props)
  }

  colonsToUnicode(text) {
    const colonsRegex = new RegExp(
      '(^|)(:[a-zA-Z0-9-_+]+:(:skin-tone-[2-6]:)?)',
      'g',
    )
    let newText = []
    let match
    let obj = []
    while ((match = colonsRegex.exec(text))) {
      // eslint-disable-line
      //console.log(match);
      let colons = match[2]
      let offset = match.index + match[1].length
      let length = colons.length
      obj.push({
        colons: colons,
        offset: offset,
        length: length,
      })
    }

    //In case no emoji
    if (obj.length === 0) {
      return text
    }

    for (let i = 0; i < obj.length; i++) {
      if (newText.length === 0) {
        newText.push(text.substring(0, obj[i].offset))
      }
      newText.push(
        <Emoji
          emoji={obj[i].colons}
          sheetSize={16}
          size={16}
          apple={true}
          key={i}
        >
          {obj[i].colons}
        </Emoji>,
      )
      // text between two emojis
      let emojiPointerEnds = obj[i].offset + obj[i].length
      if (!!obj[i + 1] && obj[i + 1].offset > emojiPointerEnds) {
        newText.push(text.substring(emojiPointerEnds, obj[i + 1].offset))
      } else if (obj.length === i + 1 && emojiPointerEnds < text.length) {
        // remaining parts incase of last emoji
        newText.push(text.substring(emojiPointerEnds, text.length))
      }
    }
    return newText
  }

  render() {
    const { data } = this.props
    return <div>{this.colonsToUnicode(data)}</div>
  }
}

Parser.propTypes = {
  text: PropTypes.string,
}
