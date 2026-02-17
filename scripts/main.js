import Dictionary from "./Dictionary.mjs";
import Chapter from "./Chapter.mjs";

const dictionaryColumn = new Dictionary();
dictionaryColumn.init();

const firstCapterColumn = new Chapter("first", dictionaryColumn);
const secondChapterColumn = new Chapter("second", dictionaryColumn);
firstCapterColumn.init();
secondChapterColumn.init();