// retrive data from localStorage
export function getLocalStorage(key) {
    return JSON.parse(localStorage.getItem(key));
}

// save data in localStorage
export function setLocalStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

export function initMenu() {
    const headerMenu = document.getElementById("headerMenu");
    const menuButton = document.getElementById("menuButton");

    // Open and close the header menu with CSS
    menuButton.addEventListener("click", () => {
        headerMenu.classList.toggle("open");
    });
}

export function setColorMode() {
    // Get the needed HTML elements
    const link = document.getElementById("colorModeLink");
    const checkbox = document.getElementById("colorModeOpt");

    // If the user has set their color mode setting to dark mode, activate it
    if (getLocalStorage("darkMode")) {
        checkbox.checked = true;
        link.setAttribute("href", "styles/darkmode.css");
    }

    // Make the setting responsive and store it for future page loads
    checkbox.addEventListener("change", () => {
        setLocalStorage("darkMode", checkbox.checked);
        if (checkbox.checked)
            link.setAttribute("href", "styles/darkmode.css");
        else
            link.setAttribute("href", "styles/lightmode.css");
    });
}

export const translations = {
    groups: [
        {
            name: "Old and New with Apocrypha",
            list: [
                {
                    id: "eng_dra",
                    name: "Douay-Rheims (1899)"
                },
                {
                    id: "eng_kja",
                    name: "King James Version (1611)"
                },
                {
                    id: "eng_rv5",
                    name: "Revised Version (1895)"
                },
                {
                    id: "eng_web",
                    name: "World English Bible (2020)"
                },
                {
                    id: "eng_wyc2017",
                    name: "Wycliffe with Modern Spelling (2017)"
                }
            ]
        },
        {
            name: "Old and New Testaments",
            list: [
                {
                    id: "eng_asv",
                    name: "American Standard Version (1901)"
                },
                {
                    id: "eng_gnv",
                    name: "Geneva Bible (1599)"
                },
                {
                    id: "eng_net",
                    name: "New English Translation (2016)"
                }
            ]
        },
        {
            name: "Old with Apocrypha",
            list: [
                {
                    id: "eng_lxx",
                    name: "Septuagint in American English (2012)"
                }
            ]
        },
        {
            name: "Old Testament Only",
            list: [
                {
                    id: "eng_jps",
                    name: "JPS TaNaKH (1917)"
                }
            ]
        }
    ]
}