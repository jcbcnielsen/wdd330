import { getLocalStorage, setLocalStorage, translations } from "./utils.mjs";

export default class VerseOfTheDay {
    constructor() {
        this.dialog = document.getElementById("verseDayDialog");
        this.text = document.getElementById("verseDayText");
        this.reference = document.getElementById("verseDayReference");
        this.showCheckbox = document.getElementById("verseDayShowOpt");
        this.transSelect = document.getElementById("verseDayTranslationSelect");
        this.seed;
    }
    async init() {
        // Load the user preferences, defaulting to
        // showing the verse of the day when loading the page, and
        // using the King James Version for the verse of the day
        if (getLocalStorage("verseDayShowOnLoad") == null)
            this.showCheckbox.checked = true;
        else
            this.showCheckbox.checked = getLocalStorage("verseDayShowOnLoad");
        let initTrans = getLocalStorage("verseDayTrans") || "eng_kja";

        // Simulate a more robust selection proccess by
        // generating a random seed that is based solely on
        // the day, regardless of user
        const date = new Date();
        this.seed = date.getUTCFullYear() + (date.getUTCMonth() * 30) + date.getUTCDate();

        // Build the translation select
        this.buildTranslationSelect.bind(this, initTrans)();

        // Update and change to the preferred translation
        // when the user changes that setting
        this.transSelect.addEventListener("change", function () {
            this.getTranslationData.bind(this)();
            setLocalStorage("verseDayTrans", this.transSelect.value);
        }.bind(this));

        // If the verse of the day is set to display when loading the page, do so.
        this.getTranslationData.bind(this)();
        if (this.showCheckbox.checked)
            this.dialog.showModal();

        // Update the localStorage if the user changes the setting
        // for showing the verse of the day when loading the page
        this.showCheckbox.addEventListener("change", function () {
            setLocalStorage("verseDayShowOnLoad", this.showCheckbox.checked)
        }.bind(this));
    }
    buildTranslationSelect(selectedTrans) {
        // Only translations with both the Old and New testaments
        // are available for the Verse of the Day, so only use the
        // first two groups in translation
        for (let i = 0; i < 2; i++) {
            // Add each translation to the select
            translations.groups[i].list.forEach(function (trans) {
                // Create the option and set its value to the id
                // and its text to its name
                const option = document.createElement("option");
                option.setAttribute("value", trans.id);
                option.innerText = trans.name;

                // Make sure to select the chosen option
                if (trans.id == selectedTrans)
                    option.setAttribute("selected", "");

                // Add the option to the select
                this.transSelect.appendChild(option);
            }.bind(this));
        }
    }
    async getTranslationData() {
        try {
            // Retrive the translation data from the bible.helloao.org API
            const response = await fetch(`https://bible.helloao.org/api/${this.transSelect.value}/books.json`);
            if (response.ok) {
                // Process the data as JSON
                const data = await response.json();
                this.getChapterData.bind(this, data.books)();
            } else {
                throw new Error(await response.text());
            }
        } catch (error) {
            console.log(error);
        }
    }
    async getChapterData(books) {
        // Randomize which book and chapter to use
        const book = this.seed % 66;
        const chapter = (this.seed % books[book].numberOfChapters) + 1;
        try {
            // Retrive the chapter data from the bible.helloao.org API
            const response = await fetch(`https://bible.helloao.org/api/${this.transSelect.value}/${books[book].id}/${chapter}.json`);
            if (response.ok) {
                // Process the data as JSON
                const data = await response.json();
                this.displayVerse.bind(this, books[book].name, chapter, data.chapter.content.filter((item) => item.type == "verse"))();
            } else {
                throw new Error(await response.text());
            }
        } catch (error) {
            console.log(error);
        }
    }
    displayVerse(book, chapter, content) {
        // Randomize which verse to use
        const verseNumber = (this.seed % content.length) + 1;
        const verse = content.find((item) => item.number == verseNumber);

        // If a verse has multiple parts,
        // combine the string parts into one
        // before adding them to the paragraph
        this.text.innerText = verse.content.reduce((previousValue, currentValue, currentIndex, array) => {
            if (currentIndex == 0) {
                if (typeof array[currentIndex] == "string")
                    return `${currentValue}`;
                else if (typeof array[currentIndex] == "object" && array[currentIndex].text)
                    return `${currentValue.text}`;
                else
                    return previousValue;
            } else if (typeof array[currentIndex] == "string")
                return `${previousValue} ${currentValue}`;
            else if (typeof array[currentIndex] == "object" && array[currentIndex].text)
                return `${previousValue} ${currentValue.text}`;
            else
                return previousValue;
        }, "");

        // Display the verse reference
        this.reference.innerText = `${book} ${chapter}:${verse.number}`;
    }
}