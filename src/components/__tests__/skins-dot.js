import React from 'react'
import { mount, configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import SkinsDot from '../skins-dot'

configure({ adapter: new Adapter() })

test('click dot to expand the menu', () => {
  let currentSkin
  const onChange = (skin) => {
    currentSkin = skin
  }
  const i18n = {
    skintones: {
      1: 'Default Skin Tone',
      2: 'Light Skin Tone',
      3: 'Medium-Light Skin Tone',
      4: 'Medium Skin Tone',
      5: 'Medium-Dark Skin Tone',
      6: 'Dark Skin Tone',
    },
  }

  const skins = mount(<SkinsDot skin={1} onChange={onChange} i18n={i18n} />)

  // component should be un-expanded by default
  expect(skins.find('[aria-haspopup]').prop('aria-label')).toEqual(
    'Default Skin Tone',
  )
  expect(skins.find('[aria-haspopup]').prop('aria-expanded')).toEqual(false)

  // simulate click
  skins.find('[aria-haspopup]').simulate('click', {
    currentTarget: {
      getAttribute(name) {
        if (name === 'data-skin') {
          return 1
        }
      },
    },
  })

  // component should now be expanded
  expect(skins.find('[aria-haspopup]').prop('aria-expanded')).toEqual(true)
  expect(skins.find('[data-skin=1]').prop('aria-pressed')).toEqual(true)
  expect(skins.find('[data-skin=2]').prop('aria-pressed')).toEqual(false)
})
