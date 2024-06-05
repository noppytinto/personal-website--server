import { Readability } from "@mozilla/readability";
import { CheerioAPI, load } from "cheerio";
import { CheerioCrawler, PuppeteerCrawler } from "crawlee";
import { RequestHandler } from "express";
import jsdom from "jsdom";
import { isValidURL } from "../utils/url";
import { get } from "http";

type PageMetadata = {
    title: string;
    description: string;
    image: string;
    favicon: string;
    error: boolean;
    errorMessage?: string;
};

const pageMetaRoute: RequestHandler = async (req, res) => {
    // get query params
    const url = req.query.url as string;
    const sanitizedUrl = sanitizeUrl(url);
    const baseUrl = new URL(sanitizedUrl).origin;

    let cheerioResponse: PageMetadata = {
        title: "",
        description: "",
        image: "",
        favicon: getFaviconSrc(baseUrl),
        error: false,
    };
    let isError403 = false;

    try {
        console.log(
            "fffffffffffffffffffffffffffffffffffffffffff trying with cheerio"
        );
        // CheerioCrawler crawls the web using HTTP requests
        // and parses HTML using the Cheerio library.
        const crawler = new CheerioCrawler({
            // Use the requestHandler to process each of the crawled pages.
            async requestHandler({ request, $, enqueueLinks, log }) {
                cheerioResponse = {
                    title: getTitle($),
                    description: getDescription($),
                    image: getImageSrc($, baseUrl),
                    favicon: getFaviconSrc(baseUrl),
                    error: false,
                };
            },
            async failedRequestHandler({ request, error, log }) {
                console.error(
                    "fffffffffffffffffffffffffffffffffffffffffff failedRequestHandler: ",
                    error
                );

                // if ((error as Error).message.includes("403")) {
                //     isError403 = true;

                //     cheerioResponse = {
                //         title: "",
                //         description: "",
                //         image: "",
                //         favicon: getFaviconSrc(baseUrl),
                //         error: true,
                //         errorMessage: String(error),
                //     };
                // } else {

                // }

                cheerioResponse = {
                    title: "",
                    description: "",
                    image: "",
                    favicon: getFaviconSrc(baseUrl),
                    error: true,
                    errorMessage: String(error),
                };
            },

            // Let's limit our crawls to make our tests shorter and safer.
            maxRequestsPerCrawl: 100,
        });

        // Add first URL to the queue and start the crawl.
        await crawler.run([sanitizedUrl]);

        // if (isError403) {
        //     console.log(
        //         "fffffffffffffffffffffffffffffffffffffffffff trying with puppeteer"
        //     );
        //     // try with puppeteer
        //     // PuppeteerCrawler crawls the web using a headless
        //     // browser controlled by the Puppeteer library.
        //     const puppeteerCrawler = new PuppeteerCrawler({
        //         // Use the requestHandler to process each of the crawled pages.
        //         async requestHandler({ request, page, enqueueLinks, log }) {
        //             await page.waitForNetworkIdle();
        //             await page.waitForSelector("body");
        //             const html = await page.content();
        //             const $ = load(html);

        //             cheerioResponse = {
        //                 title: getTitle($),
        //                 description: getDescription($),
        //                 image: getImageSrc($, baseUrl),
        //                 favicon: getFaviconSrc(baseUrl),
        //                 error: false,
        //             };
        //         },
        //         // headless: false,
        //         async failedRequestHandler({ request, error, log }) {
        //             console.error(
        //                 "fffffffffffffffffffffffffffffffffffffffffff puppeteer failedRequestHandler: ",
        //                 error
        //             );

        //             cheerioResponse = {
        //                 title: "",
        //                 description: "",
        //                 image: "",
        //                 favicon: "",
        //                 error: true,
        //                 errorMessage: String(error),
        //             };
        //         },
        //         maxRequestsPerCrawl: 100,
        //     });

        //     // Add first URL to the queue and start the crawl.
        //     await puppeteerCrawler.run([sanitizedUrl]);

        //     res.setHeader("Content-Type", "application/json; charset=utf-8")
        //         .status(200)
        //         .json({
        //             title: cheerioResponse.title,
        //             description: cheerioResponse.description,
        //             image: cheerioResponse.image,
        //             favicon: cheerioResponse.favicon,
        //             error: cheerioResponse.error,
        //             errorMessage: cheerioResponse.errorMessage,
        //         });

        //     return;
        // }

        res.setHeader("Content-Type", "application/json; charset=utf-8")
            .status(200)
            .json({
                title: cheerioResponse.title,
                description: cheerioResponse.description,
                image: cheerioResponse.image,
                favicon: cheerioResponse.favicon,
                error: cheerioResponse.error,
                errorMessage: cheerioResponse.errorMessage,
            });

        return;
    } catch (error) {
        console.error(
            "fffffffffffffffffffffffffffffffffffffffffff ERROR fetching page metadata:",
            error
        );

        res.setHeader("Content-Type", "application/json; charset=utf-8")
            .status(200)
            .json({
                title: "",
                description: "",
                image: "",
                favicon: getFaviconSrc(baseUrl),
                error: true,
                errorMessage: String(error),
            });
    }
};

function getFaviconSrc(baseUrl: string) {
    // const favicon = $('link[rel="icon"]').attr("href");
    // if (!favicon) {
    //   const googleFavicon = "https://www.google.com/s2/favicons?domain=" + baseUrl;
    //   return googleFavicon;
    // }

    console.log(
        "fffffffffffffffffffffffffffffffffffffffffff baseUrl:",
        baseUrl
    );

    return new URL("https://www.google.com/s2/favicons?domain=" + baseUrl).href;
}

function getTitle($: CheerioAPI) {
    return $('meta[property="og:title"]').attr("content") || $("title").text();
}

function getDescription($: CheerioAPI) {
    const cheerioDescription =
        $('meta[property="og:description"]').attr("content") ||
        $('meta[name="description"]').attr("content");

    let finalDescription = cheerioDescription;

    // try to get description using Mozilla Readability
    if (!cheerioDescription) {
        const jsDoc = new jsdom.JSDOM($.html());
        const doc = jsDoc.window.document; // transform jsdom document to dom document
        const reader = new Readability(doc);
        const article = reader.parse();
        finalDescription = article?.excerpt;
    }

    return finalDescription || "";
}

function getImageSrc($: CheerioAPI, baseUrl: string) {
    const cheerioSrc =
        $('meta[property="og:image"]').attr("content") ||
        $('meta[name="twitter:image"]').attr("content") ||
        // itemprop="image" is used by Google
        $('meta[itemprop="image"]').attr("content") ||
        // other sources
        $('link[rel="apple-touch-icon"]').attr("href");

    let finalImageSrc = "";
    if (!cheerioSrc) {
        return "";
    }
    if (cheerioSrc.startsWith("/")) {
        finalImageSrc = baseUrl + cheerioSrc;
    } else if (isValidURL(cheerioSrc)) {
        finalImageSrc = cheerioSrc;
    }

    return finalImageSrc;
}

function sanitizeUrl(url: string) {
    // trim and remove trailing slash
    const trimmedUrl = new URL(url).href;
    return trimmedUrl.replace(/\/$/, "");
}

/**
 * Only use this function
 * if the page is dynamic and requires JavaScript to render
 * @param url
 */
// const getPageContentWithPuppeteer = async (url: string) => {
//     // resolve puppeteer chromium path
//     const stats = await PCR({});

//     console.log(
//         "fffffffffffffffffffffffffffffffffffffffffff stats:",
//         stats.executablePath
//     );

//     // get page content using puppeteer in headless mode
//     const browser = await puppeteer.launch({
//         headless: true, // use new headless mode (recommended)
//         executablePath: stats.executablePath,
//     });

//     const page = await browser.newPage();
//     await page.setViewport({ width: 1920, height: 1080 });
//     await page.goto(url);
//     // await page.waitForNetworkIdle(); // Wait for network resources to fully load
//     const pageData = await page.content();
//     await browser.close();

//     return pageData;
// };

export default pageMetaRoute;
