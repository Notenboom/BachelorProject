export const HOST = process.env.NODE_ENV === 'production' 
? "https://bachelorproject-324708.ey.r.appspot.com" 
: "https://localhost:5001";

export const COLORS = ["#003f5c", "#ffa600", "#58508d", "#ff6361", "#bc5090"];

export const DATE_LOCALE = 'en-GB';
export const DATE_OPTIONS = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric'
};
export const TIME_OPTIONS = {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric'
};
