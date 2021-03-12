import prebuiltIndexData from '../../../data/prebuilt-index-all.json'
import NimbleEmojiIndex from './nimble-emoji-index'

// HOW TO GENERATE PREBUILT-INDEX:
// import indexData from '../../../data/all.json'
// const emojiIndex = new NimbleEmojiIndex(data);
// (emojiIndex as any).printIndex();

const emojiIndex = new NimbleEmojiIndex({}, undefined, prebuiltIndexData);
const { emojis, emoticons } = emojiIndex

function search() {
  return emojiIndex.search(...arguments)
}

export default { search, emojis, emoticons }
