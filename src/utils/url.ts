const urlPattern = new RegExp(
    /^(https?:\/\/)?([\w.-]+)\.([a-z]{2,})(:\d{1,5})?(\/[^?#]*)*(\?([^#]*))?(#.*)?$/i,
);
const urlPattern2 = new RegExp(
    /[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/,
);

export function isValidURL(url: string) {
    if (!url) {
        return false;
    }

    if (!url.match(urlPattern)) {
        return false;
    }

    return url.match(urlPattern)?.[0] === null;
}
