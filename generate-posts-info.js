const RSSParser = require('rss-parser');
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('node:fs');
const jsdom = require("jsdom");

const parser = new RSSParser();

async function fetchRSS(url) {
  try {
    const feed = await parser.parseURL(url);
    const feedItems = feed.items.map(item => ({
      title: item.title,
      description: item.contentSnippet || item.content || item.summary,
      link: item.link,
    }));
    const posts = [];
    for (const item of feedItems) {
      const coverImage = await fetchCoverImage(item.link);
      item.coverImage = coverImage;
      
      const response = await fetch(`https://simple-proxy-topaz.vercel.app/?destination=${item.link}`);
      const data = await response.text();
      const html = getHtml(coverImage, item, data)
                              .replace(/<!--dle_media_begin:(https:\/\/www\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]+))--><iframe[^>]*><\/iframe><!--dle_media_end-->/g,'<div class="center-content"><iframe src="https://www.youtube.com/embed/$2?si=N_0NMzQvmXnh-Ojo" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen=""></iframe></div>')
                              .replace(/<h2>(?:(?!Updated).)*?<\/h2>/g,'<div class="title-bookmark">$&</div><br>')
                              .replace(/<div class="title-bookmark"><h2>(.*?)<\/h2><\/div>/g,'<div class="title-bookmark">$1</div><br>')
                              .replace(/[^\u0000-\u007F\u0600-\u06FF\u0750-\u077F\u0590-\u05FF\u0900-\u097F\u4E00-\u9FFF\/\\]/g,"")
                              .replace(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]+/g, function(match) {return `<span lang="ar">${match}</span>`;});
      fs.writeFileSync(item.link.replace("https://modbay.org/", "content/"), html);
      posts.push(item);
    }
    const jsonString = await fs.promises.readFile('./assets/json/posts.json', 'utf8');
    const data = JSON.parse(jsonString);
    data.mods = posts;
    await fs.promises.writeFile('./assets/json/posts.json', JSON.stringify(data, null, 2));

  } catch (error) {
    console.error(`Failed to fetch RSS feed from ${url}:`, error);
  }
}

async function fetchCoverImage(url) {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const coverImage = $('meta[name="twitter:image"]').attr('content') || $('meta[property="og:image"]').attr('content');
    return coverImage || null;
  } catch (error) {
    console.error(`Failed to fetch cover image from ${url}:`, error);
    return null;
  }
}

const rssURL = 'https://modbay.org/user/MBArabic/rss.xml';
fetchRSS(rssURL);

function cleanHTML(htmlString){
  const html = new jsdom.JSDOM(htmlString);
  const document = html.window.document;
  const attributesToRemove = [ "height", "width" , "style","contenteditable", "white-space","itemprop","sizes","decoding","data-srcset","srcset","content"];
  const article = document.querySelector('.full_art');
  
  function traverseAndClean(node) {
    if(!node) return;
    if (node.nodeType === 1) {
      removeAttributes(node);
    }
    node.childNodes.forEach((child) => traverseAndClean(child));
  }
  function removeAttributes(element) {
    if(element.src && !element.src.includes("modbay.org")){
      element.src = "https://modbay.org" + element.src;
    }
    attributesToRemove.forEach((attr) => {
      element.removeAttribute(attr);
    });
  }

  article.childNodes.forEach((child) => {traverseAndClean(child);});
  return article.innerHTML;
}

function getHtml(coverImage, item, data) {
  const articleHtml = 
            `<!DOCTYPE html>
            <html lang="en">
              <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <meta property="og:title" content="${item.title}"/>
                <meta property="og:image" content="${coverImage}"/>
                <meta property="og:description" content="${item.description}"/>
                <title>${item.title}</title>
                <link rel="stylesheet" href="../../assets/css/styles.css" />
                <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1144521904849121"crossorigin="anonymous"></script>
              </head>
              <body>
                <audio id="clickSound" src="../../assets/sounds/click.mp3" preload="auto"></audio>
                <div class="overlay">
                  <div class="border-1"></div>
                  <div class="border-1 border-2"></div>
                  <div class="post-details" style="color: white">
                    <div class="format-page">
                      ${cleanHTML(data)}
                    </div>
                  </div>
                    <div class="center-button">
                      <button class="download-button" onclick="download('${item.link.split('/').pop().replace('.html','')}')">Download</button>
                    </div>
                </div>
                <script src="../../assets/js/article.js"></script>
              </body>
            </html>`
  return articleHtml;
}


const username = 'MinecraftBedrockArabic';
const apiUrl = `https://api.github.com/users/${username}/repos?per_page=100`;

fetch(apiUrl)
  .then(response => response.json())
  .then(async data => {
    const repos = data.filter(repo => repo.fork === false).map(repo => ({
      title: repo.name,
      description: repo.description??"",
      link: repo.html_url,
      coverImage: `https://opengraph.githubassets.com/hash123/${username}/${repo.name}`
    }));
    const jsonString = await fs.promises.readFile('./assets/json/posts.json', 'utf8');
    const data1 = JSON.parse(jsonString);
    data1.others = repos;
    await fs.promises.writeFile('./assets/json/posts.json', JSON.stringify(data1, null, 2));
  })
  .catch(error => console.error('Error fetching repositories:', error));
