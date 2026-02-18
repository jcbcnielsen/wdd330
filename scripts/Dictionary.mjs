import { getLocalStorage, setLocalStorage } from "./utils.mjs";

export default class Dictionary {
    constructor() {
        this.column = document.getElementById("dictionaryColumn");
        this.dialog = document.getElementById("dictionaryDialog");
        this.wordList = [];
    }
    async init() {
        // Get list of most recent words remembered
        if (getLocalStorage("wordList"))
            this.wordList = getLocalStorage("wordList");

        // If there are words stored in localStorage,
        // get their entries and display them
        if (this.wordList.length) {
            for (let i = Math.max(this.wordList.length - 3, 0); i < this.wordList.length; i++) {
                setTimeout(this.getEntry.bind(this, i, false), i * 500);
            }
        }
    }
    async getEntry(index, retry) {
        try {
            // Retrive the data from the freedictionaryapi.com API
            const response = await fetch(`https://freedictionaryapi.com/api/v1/entries/en/${this.wordList[index]}`);
            if (response.ok) {
                const data = await response.json();
                if (data.entries.length) {
                    // If there are entries for the word, add them
                    this.addEntry.bind(this, data.entries, index)();
                } else if (!retry) {
                    // If there are no entries, try to see if the word needs to be lowercase
                    // because the API is case-sensitive
                    this.wordList[index] = this.wordList[index].toLowerCase();
                    this.getEntry.bind(this, index, true)();
                } else {
                    // If the word isn't in the dictionary at all,
                    // notify the user of this.
                    this.notifyNoEntry();
                }
            } else {
                throw new Error(response.text());
            }
        } catch (error) {
            console.log(error);
        }
    }
    addEntry(data, index) {
        // Create the div element
        const entry = document.createElement("div");
        entry.classList.add("dictionaryEntry");

        // Create the h2 element and add the word to it
        const h2 = document.createElement("h2");
        h2.innerText = this.wordList[index];
        entry.appendChild(h2);

        // Loop through the available parts of speech
        // and add them with definitions to the entry
        data.forEach(function (obj) {
            // Add the part of speech to the entry
            const h3 = document.createElement("h3");
            h3.innerText = obj.partOfSpeech;
            entry.appendChild(h3);

            // Loop through the definitions and add
            // them to a list for each part of speech
            const ul = document.createElement("ul");
            obj.senses.forEach(function (sense) {
                const li = document.createElement("li");
                li.innerText = sense.definition;
                ul.appendChild(li);
            }.bind(this));

            // Add the list to the entry
            entry.appendChild(ul);
        }.bind(this));

        // Add the entry to the dictionary
        this.column.prepend(entry);
        
        // Ensure there are a max of three entries
        // and update the word list in localStorage
        if (this.column.childElementCount > 3)
            this.column.lastChild.remove();
        let wordsToStore = [];
        for (let i = Math.max(this.wordList.length - 3, 0); i < this.wordList.length; i++) {
            wordsToStore.push(this.wordList[i]);
        }
        this.wordList = wordsToStore;
        setLocalStorage("wordList", this.wordList);
    }
    notifyNoEntry() {
        const word = this.wordList.pop();
        this.dialog.innerHTML = `
            <p>Sorry, but "${word.toUpperCase()}" isn't in this dictionary.</p>
            <button commandfor="dictionaryDialog" command="close">OK</button>`;
        this.dialog.showModal();
    }
}

/*let word;
if (this.wordList[index].match(regex))
    word = this.wordList[index].slice(0, this.wordList.search(regex))
else
    word = this.wordList[index];*/

/*<div class="dictionaryEntry">
    <h2>{word}</h2>
    <h3>{partOfSpeech}</h3>
    <ul>
        <li>{definition}</li>
        <li>{definition}</li>
        ...
    </ul>
    <h3>{partOfSpeech}</h3>
    <ul>
        <li>{definition}</li>
        <li>{definition}</li>
        ...
    </ul>
    ...
</div>*/