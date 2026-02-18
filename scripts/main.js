import { initMenu, setColorMode } from "./utils.mjs";
import VerseOfTheDay from "./VerseOfTheDay.mjs";
import Dictionary from "./Dictionary.mjs";
import Chapter from "./Chapter.mjs";

// Make the menu button functional
initMenu();

// Set the color mode for the page
setColorMode();

// Initialize the verse of the day
const verseDay = new VerseOfTheDay();
verseDay.init();

// Initialize the dictionary
const dictionaryColumn = new Dictionary();
dictionaryColumn.init();

// Initialize the chapter columns
const firstCapterColumn = new Chapter("first", dictionaryColumn);
const secondChapterColumn = new Chapter("second", dictionaryColumn);
firstCapterColumn.init();
secondChapterColumn.init();