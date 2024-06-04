import { RequestHandler } from "express";
import { CheerioAPI, load } from "cheerio";
import puppeteer from "puppeteer";
import jsdom from "jsdom";
import { Readability } from "@mozilla/readability";
// @ts-ignore
import PCR from "puppeteer-chromium-resolver";
import { isValidURL } from "../utils/url";

const pageMetaRoute: RequestHandler = async (req, res) => {
  // get query params
  const url = req.query.url as string;

  console.log("ffffffffffffffffffffffffff url", url);

  const sanitizedUrl = sanitizeUrl(url);
  const baseUrl = new URL(sanitizedUrl).origin;

  console.log("ffffffffffffffffffffffffff sanitizedUrl", sanitizedUrl);
  console.log("ffffffffffffffffffffffffff baseUrl", baseUrl);

  try {
    const response = await fetch(sanitizedUrl);

    if (!response.ok) {
      // if Forbidden,
      // because for example
      // the page is dynamic and requires JavaScript to render
      console.log(
        "fffffffffffffffffffffffffffffffffffffffffff response.status :",
        response.status,
      );
      if (response.status === 403) {
        console.log(
          "fffffffffffffffffffffffffffffffffffffffffff using puppeteer",
        );
        const pageContent = await getPageContentWithPuppeteer(sanitizedUrl);
        const $ = load(pageContent);

        res
          .setHeader("Content-Type", "application/json; charset=utf-8")
          .status(200)
          .json({
            title: getTitle($),
            description: getDescription($),
            image: getImageSrc($, baseUrl),
            favicon: getFaviconSrc(baseUrl),
            html: pageContent,
            error: false,
            errorMessage: "",
          });

        return;
      }

      // if any other error
      res
        .setHeader("Content-Type", "application/json; charset=utf-8")
        .status(200)
        .json({
          title: "",
          description: "",
          image: "",
          favicon: "",
          error: true,
          errorMessage: String("ERROR" + response.statusText),
        });

      return;
    }

    // get page metadata using cheerio
    const html = await response.text();
    const $ = load(html);

    res
      .setHeader("Content-Type", "application/json; charset=utf-8")
      .status(200)
      .json({
        title: getTitle($),
        description: getDescription($),
        image: getImageSrc($, baseUrl),
        favicon: getFaviconSrc(baseUrl),
        html,
        error: false,
        errorMessage: "",
      });

    return;
  } catch (error) {
    console.error(
      "fffffffffffffffffffffffffffffffffffffffffff ERROR fetching page metadata:",
      error,
    );

    res
      .setHeader("Content-Type", "application/json; charset=utf-8")
      .status(200)
      .json({
        title: "",
        description: "",
        image: "",
        favicon: "",
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

  console.log("fffffffffffffffffffffffffffffffffffffffffff baseUrl:", baseUrl);

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
const getPageContentWithPuppeteer = async (url: string) => {
  // resolve puppeteer chromium path
  const stats = await PCR({});

  console.log(
    "fffffffffffffffffffffffffffffffffffffffffff stats:",
    stats.executablePath,
  );

  // get page content using puppeteer in headless mode
  const browser = await puppeteer.launch({
    headless: true, // use new headless mode (recommended)
    executablePath: stats.executablePath,
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto(url);
  // await page.waitForNetworkIdle(); // Wait for network resources to fully load
  const pageData = await page.content();
  await browser.close();

  return pageData;
};

export default pageMetaRoute;
