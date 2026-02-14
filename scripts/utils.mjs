// retrive data from localStorage
export function getLocalStorage(key) {
    return JSON.parse(localStorage.getItem(key));
}

// save data in localStorage
export function setLocalStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}