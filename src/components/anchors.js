import React from 'react'
import PropTypes from 'prop-types'

export default class Anchors extends React.PureComponent {
  constructor(props) {
    super(props)

    let defaultCategory = props.categories.filter(
      (category) => category.first,
    )[0]

    this.state = {
      selected: defaultCategory.name,
    }

    this.handleClick = this.handleClick.bind(this)
  }

  handleClick(e) {
    const index = e.currentTarget.getAttribute('data-index')
    const { categories, onAnchorClick, titleIndexes } = this.props
    const category = categories[index]

    onAnchorClick(category, index, titleIndexes[category.id])
  }

  render() {
    var { categories, color, i18n, icons } = this.props,
      { selected } = this.state

    return (
      <nav className="emoji-mart-anchors" aria-label={i18n.categorieslabel}>
        {categories.map((category, i) => {
          var { id, name, anchor } = category,
            isSelected = name == selected

          if (anchor === false) {
            return null
          }

          const iconId = id.startsWith('custom-') ? 'custom' : id

          return (
            <button
              key={id}
              aria-label={i18n.categories[iconId]}
              title={i18n.categories[iconId]}
              data-index={i}
              type={'button'}
              onClick={this.handleClick}
              className={`emoji-mart-anchor ${
                isSelected ? 'emoji-mart-anchor-selected' : ''
              }`}
              style={{ color: isSelected ? color : null }}
            >
              <div className="emoji-mart-anchor-icon">
                {icons.categories[iconId]()}
              </div>
              <span
                className="emoji-mart-anchor-bar"
                style={{ backgroundColor: color }}
              />
            </button>
          )
        })}
      </nav>
    )
  }
}

Anchors.propTypes /* remove-proptypes */ = {
  categories: PropTypes.array,
  onAnchorClick: PropTypes.func,
  icons: PropTypes.object,
}

Anchors.defaultProps = {
  categories: [],
  onAnchorClick: () => {},
  icons: {},
}
