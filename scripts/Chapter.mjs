import { getLocalStorage, setLocalStorage, translations } from "./utils.mjs";

export default class Chapter {
    constructor(number, dictionary) {
        this.number = number;
        this.column = document.getElementById(`${number}ChapterColumn`);
        this.transSelect = document.getElementById(`${number}ColumnTranslationSelect`);
        this.bookSelect = document.getElementById(`${number}ColumnBookSelect`);
        this.chaptSelect = document.getElementById(`${number}ColumnChapterSelect`);
        this.readButton = document.getElementById(`${number}ColumnReadButton`);
        this.columnContent = document.getElementById(`${number}ColumnContent`);
        this.dictionary = dictionary;
    }
    async init() {
        // Retrive the previously set Translation, Book,
        // and Chapter or default to Genesis 1 (KJV)
        let initTrans = getLocalStorage(`${this.number}Trans`) || "eng_kja";
        let initBook = getLocalStorage(`${this.number}Book`) || "GEN";
        let initChapt = getLocalStorage(`${this.number}Chapt`) || "1";

        // Build the initial select elements with
        // either the previous or default selections
        this.buildTranslationSelect.bind(this, initTrans)();
        this.getTranslationData.bind(this, initBook, initChapt)();

        // Add an event listener to reset the book and chapter selects when choosing a translation
        // and to set the localStorage appropriately
        this.transSelect.addEventListener("change", function () {
            this.getTranslationData.bind(this, "GEN", "1")();
            setLocalStorage(`${this.number}Trans`, this.transSelect.value);
            setLocalStorage(`${this.number}Book`, "GEN");
            setLocalStorage(`${this.number}Chapt`, "1");
        }.bind(this));
        
        // Add an event listener to reset the chapter select when choosing a book
        // and to set the localStorage appropriately
        this.bookSelect.addEventListener("change", function () {
            this.buildChapterSelect.bind(this, "1")();
            setLocalStorage(`${this.number}Book`, this.bookSelect.value);
            setLocalStorage(`${this.number}Chapt`, "1");
        }.bind(this));

        this.chaptSelect.addEventListener("change", function () {
            this.getChapterData.bind(this)();
            setLocalStorage(`${this.number}Chapt`, this.chaptSelect.value);
        }.bind(this));
    }
    buildTranslationSelect(selectedTrans) {
        // Reset the select element
        this.transSelect.innerHTML = "";

        // Loop through the translation groups
        translations.groups.forEach(function (group) {
            // Create and label an optgroup for each translation group
            const optgroup = document.createElement("optgroup");
            optgroup.setAttribute("label", group.name);

            // Create an option for each translation
            group.list.forEach(function (trans) {
                const option = document.createElement("option");
                option.setAttribute("value", trans.id);

                // Make sure to select the chosen option
                if (trans.id == selectedTrans)
                    option.setAttribute("selected", "");

                option.innerText = trans.name;
                optgroup.appendChild(option);
            });

            this.transSelect.appendChild(optgroup);
        }.bind(this));
    }
    async getTranslationData(selectedBook, selectedChapter) {
        try {
            // Retrive the translation data from the bible.helloao.org API
            const response = await fetch(`https://bible.helloao.org/api/${this.transSelect.value}/books.json`);
            if (response.ok) {
                // Process the data as JSON
                const data = await response.json();
                this.buildBookSelect.bind(this, data.books, selectedBook, selectedChapter)();
            } else {
                throw new Error(await response.text());
            }
        } catch (error) {
            console.log(error);
        }
    }
    buildBookSelect(bookList, selectedBook, selectedChapter) {
        // Reset the select element
        this.bookSelect.innerHTML = "";

        // Loop through the books in the list,
        // and adding them to the select element
        for (let i = 0; i < bookList.length; i++) {
            const option = document.createElement("option");
            option.setAttribute("name", bookList[i].id);
            option.setAttribute("value", bookList[i].id);
            if (bookList[i].id == selectedBook)
                option.setAttribute("selected", "");
            option.innerText = bookList[i].name;
            option.numberOfChapters = bookList[i].numberOfChapters;
            this.bookSelect.appendChild(option);
        }

        this.buildChapterSelect.bind(this, selectedChapter)();
    }
    buildChapterSelect(selectedChapter) {
        // Reset the select element
        this.chaptSelect.innerHTML = "";

        // Get the number of chapters in the selected book
        const numberOfChapters = this.bookSelect.namedItem(this.bookSelect.value).numberOfChapters;

        // Create an option for each chapter
        for (let i = 1; i <= numberOfChapters; i++) {
            const option = document.createElement("option");
            option.setAttribute("value", i);
            if (i == selectedChapter)
                option.setAttribute("selected", "");
            option.innerText = i;
            this.chaptSelect.appendChild(option);
        }

        // Display the chapter's content
        this.getChapterData.bind(this)();
    }
    async getChapterData() {
        try {
            // Retrive the chapter data from the bible.helloao.org API
            const response = await fetch(`https://bible.helloao.org/api/${this.transSelect.value}/${this.bookSelect.value}/${this.chaptSelect.value}.json`);
            if (response.ok) {
                // Process the data as JSON
                const data = await response.json();
                this.displayChapter.bind(this, data.chapter.content)();
            } else {
                throw new Error(await response.text());
            }
        } catch (error) {
            console.log(error);
        }
    }
    displayChapter(chapterContent) {
        // Reset the verse list
        this.columnContent.innerHTML = "";

        // Go through the chapter's content, adding each verse to the list
        chapterContent.forEach(function (verse) {
            if (verse.type == "verse") {
                const li = document.createElement("li");

                // If a verse has multiple parts,
                // combine the string parts into one
                // before adding them to the list item
                li.innerText = verse.content.reduce((previousValue, currentValue, currentIndex, array) => {
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

                // Make the verse clickable
                // before adding it to the list
                li.addEventListener("click", this.pickVerse.bind(this, li));
                this.columnContent.appendChild(li);
            }
        }.bind(this));
    }
    pickVerse(li) {
        const wordList = li.innerText.split(" ");
        li.innerText = "";
        wordList.forEach(function (word) {
            const span = document.createElement("span");
            span.innerText = `${word} `;
            span.addEventListener("click", this.pickWord.bind(this, span));
            li.appendChild(span);
        }.bind(this));
    }
    pickWord(span) {
        // Cleanse the word of whitespace and punctuation
        const regex = /[\s\.,:;!?'"()]/;
        let word;
        if (span.innerText.search(regex) == 0)
            word = span.innerText.slice(1, span.innerText.search(regex));
        else
            word = span.innerText.slice(0, span.innerText.search(regex));

        // Add the word to the dictionary
        this.dictionary.getEntry(this.dictionary.wordList.push(word) - 1, false);
    }
}

/*<optgroup label="Old and New with Apocrypha">
    <option value="eng_dra">Douay-Rheims (1899)</option>
    <option value="eng_kja">King James Version (1611)</option>
    <option value="eng_rv5">Revised Version (1895)</option>
    <option value="eng_web">World English Bible (2020)</option>
    <option value="eng_wyc2017">Wycliffe with Modern Spelling (2017)</option>
</optgroup>
<optgroup label="Old and New Testaments">
    <option value="eng_asv">American Standard Version (1901)</option>
    <option value="eng_gnv">Geneva Bible (1599)</option>
    <option value="eng_net">New English Translation (2016)</option>
</optgroup>
<optgroup label="Old with Apocrypha">
    <option value="eng_lxx">Septuagint in American English (2012)</option>
</optgroup>
<optgroup label="Old Testament Only">
    <option value="eng_jps">JPS TaNaKH (1917)</option>
</optgroup>*/