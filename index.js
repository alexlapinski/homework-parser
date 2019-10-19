const axios = require('axios');
const cheerio = require('cheerio');
const nlp = require('compromise');
const R = require('ramda');
const turndown = require('turndown');

if (R.path(['env', 'NODE_ENV'], process) !== 'production') {
    const dotenv = require('dotenv');
    dotenv.config();
}

const getErrorMessage = R.prop('message');

const getSettings = () => ({
    url: R.path(['env', 'HOMEWORK_URL'], process),
    selector: R.path(['env', 'CONTENT_SELECTOR'], process),
});

const getPageHtml = async (url) => {
    let response;
    try {
        response = await axios.get(url);
    } catch(error) {
        console.error(`Error fetching page: ${getErrorMessage(error)}`);
        return null;
    }
    
    return R.prop('data', response);
};

const parsePageHtml = (html, selector) => {
    const $ = cheerio.load(html);
    const text = $(selector).text().trim();
    return text;
};

const parseText = (text) => {
    nlp(text);
};

const htmlToMarkdown = (html, selector) => {
    const $ = cheerio.load(html);
    const text = $(selector).html();
    const turndownService = new turndown();
    return turndownService.turndown(text);
};

const main = async () => {
    const settings = getSettings();

    let html;
    try {
        html = await getPageHtml(R.prop('url', settings));
    } catch (error) {
        console.error(`Error getting page HTML: ${getErrorMessage(error)}`)
        return;
    }
    
    const text = parsePageHtml(html, R.prop('selector', settings));
    console.log('# Raw Text');
    console.log(text);

    // const markdown = htmlToMarkdown(html, R.prop('selector', settings));
    // console.log('# Markdown Text');
    // console.log(markdown);
};

if (require.main === module) {
    try {
        main();
    } catch(error) {
        console.error(error.message);
    }
}

module.exports = {
    getErrorMessage,
    getPageHtml,
    getSettings,
    parsePageHtml,
    main,
};