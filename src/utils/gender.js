function isFemale(name) {
  return (
    name.startsWith('female') ||
    (name.includes('woman') &&
      !(name.includes('-man') || name.startsWith('man-'))) ||
    [
      'girl',
      'princess',
      'person_with_headscarf',
      'breast-feeding',
      'mermaid',
      'mrs_claus',
      'dancer',
      'two_women_holding_hands',
    ].includes(name) ||
    name.startsWith('bride')
  )
}
function isMale(name) {
  return (
    name.startsWith('male') ||
    (name.includes('man') && !name.includes('woman')) ||
    [
      'boy',
      'prince',
      'bearded_person',
      'santa',
      'two_men_holding_hands',
    ].includes(name)
  )
}
function isNeutral(name) {
  return [
    'older_adult',
    'cop',
    'sleuth_or_spy',
    'guardsman',
    'construction_worker',
    'man_with_turban',
    'person_with_blond_hair',
    'mage',
    'fairy',
    'merperson',
    'elf',
    'genie',
    'zombie',
    'person_frowning',
    'vampire',
    'ok_woman',
    'person_with_pouting_face',
    'raising_hand',
    'bow',
    'face_palm',
    'shrug',
    'massage',
    'haircut',
    'walking',
    'dancers',
    'person_in_steamy_room',
    'no_good',
    'information_desk_person',
    'runner',
    'person_climbing',
    'person_in_lotus_position',
    'golfer',
    'surfer',
    'swimmer',
    'rowboat',
    'person_with_ball',
    'weight_lifter',
    'bicyclist',
    'mountain_bicyclist',
    'person_doing_cartwheel',
    'wrestlers',
    'water_polo',
    'handball',
    'juggling',
    'couplekiss',
    'couple_with_heart',
    'family',
  ].includes(name)
}

const genderFilters = [
  (name) => {
    // return male emojis
    // console.log(name, !(name.startsWith && isFemale(name)))
    return !(name.startsWith && (isFemale(name) || isNeutral(name)))
  },
  (name) => {
    // return female emojis
    // console.log(name, !(name.startsWith && isMale(name)))
    return !(name.startsWith && (isMale(name) || isNeutral(name)))
  },
]

export default genderFilters
