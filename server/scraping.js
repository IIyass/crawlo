const puppeteer = require("puppeteer");
const urls = ["https://www.mediamarkt.es"];
const ProductModel = require("./productModel");

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/crawlo', {useNewUrlParser: true, useUnifiedTopology: true})

const db = mongoose.connection;
db.on('connecting', () => console.error('connection connecting ...'))
db.on('open', () => console.log('connected successfully ~'))
db.on('error', (e) => console.error('connection error:', e))

const getCategories = async (page, url) => {
  await page.goto(url);

  await page.$eval("button.categories-button", (form) => form.click());

  const categories = await page.evaluate(async () => {
    const selector = `div.CategoryNavigation__StyledSlidingContainer-sj436x-1 > div > ul:nth-child(4) > li > a`;
    return Array.from(document.querySelectorAll(selector), (category) => {
      return { title: category.textContent.trim(), href: category.href };
    });
  });

  return categories;
};

const getSubCategories = async (page, category) => {
  await page.goto(category.href);
  const subcategories = await page.evaluate(() => {
    const selector = ".kAsbxA > div:nth-child(1) > div > div > div > div > a";
    return Array.from(
      document.querySelectorAll(`${selector}`),
      (subcategory) => {
        return {
          title: subcategory.textContent.trim(),
          href: subcategory.href,
        };
      }
    );
  });

  return subcategories;
};

const getProducts = async (page, subcategory, numberOfPages) => {
  var products = [];

  for (let i = 0; i < numberOfPages; i++) {
    await page.goto(`${subcategory.href}?page=${i + 1}`);
    const prods = await page.evaluate(() => {
      const selectorName =
        "div.FlexBox__StyledFlexItem-sc-1vld6r2-1.LJtJy.ProductTilestyled__StyledFlexItemHeadline-sc-1w38xrp-8.eFfnRo > div > div.ProductHeader__StyledHeadingWrapper-cwyxax-0.gQJaMt > p";
      const selectorImage =
        "div.FlexBox__StyledFlexItem-sc-1vld6r2-1.LJtJy.ProductTilestyled__StyledFlexItem-sc-1w38xrp-6.ProductTilestyled__StyledProductImageFlexItem-sc-1w38xrp-9.cIiZEr.hxaFXn > div > div > div > picture > img";
      const selectorPrice =
        " div.FlexBox__StyledFlexItem-sc-1vld6r2-1.LJtJy.ProductTilestyled__StyledFlexItem-sc-1w38xrp-6.ProductTilestyled__StyledPriceFlexItem-sc-1w38xrp-10.cIiZEr.lbPluO > div.ProductPricing__StyledPriceWrapper-sc-1h7lp7p-1.cErrvV > div > div.PriceRow__StyledPriceRow-vxrds0-0.gtukkx > div > div:nth-child(2) > div > span";
      const selectorDelivery =
        " div.FlexBox__StyledFlexItem-sc-1vld6r2-1.LJtJy.ProductTilestyled__StyledFlexItem-sc-1w38xrp-6.ProductTilestyled__StyledPriceFlexItem-sc-1w38xrp-10.cIiZEr.lbPluO > div.MediaStyleSwitch__StyledMediaStyleSwitch-sc-1s1z6np-0.gLGosC.ProductTilestyled__StyledMediaStyleSwitch-sc-1w38xrp-11.dJNuiN > div > div:nth-child(1) > div > div.Availabilitystyled__StyledAvailabilityHeadingWrapper-sc-901vi5-2.duCLGf > span";

      const selectorUrl =
        "#root > div.indexstyled__StyledAppWrapper-sc-1hu9cx8-0.klAfyt > main > div.Grid__StyledGrid-fs0zc2-0.cQIsoQ > div > div.Cellstyled__StyledCell-sc-1wk5bje-0.htWuLc > div.ProductsListstyled__ProductContainer-hvfn1t-1.kpftUn > div > div > a";

      const url = Array.from(
        document.querySelectorAll(`${selectorUrl}`),
        (elm) => elm.href
      );

      const image = Array.from(
        document.querySelectorAll(`${selectorImage}`),
        (elm) => elm.src
      );

      const name = Array.from(
        document.querySelectorAll(`${selectorName}`),
        (elm) => elm.textContent
      );

      const price = Array.from(
        document.querySelectorAll(`${selectorPrice}`),
        (elm) => elm.textContent
      );

      const delivery = Array.from(
        document.querySelectorAll(`${selectorDelivery}`),
        (elm) => elm.textContent
      );

      const result = url.map((url, index) => {
        return {
          delivery: delivery[index],
          price: price[index],
          url,
          name: name[index],
          image: image[index],
        };
      });

      return result;
    });
    products.push.apply(products, prods);
  }
  return products;
};

const handleResults = async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.setDefaultNavigationTimeout(0);
  for (let url of urls) {
    var categories = await getCategories(page, url);

    var nunberOfCatgories = 2;
    for (let i = 0; i < nunberOfCatgories; i++) {
      let numberOfPages = 1;
      var subcategories = await getSubCategories(page, categories[i]);

      for (let j = 0; j < numberOfPages; j++) {
        const products = await getProducts(
          page,
          subcategories[j],
          numberOfPages
        );

        products.forEach( elm => {
            const product = new ProductModel(elm);
            product.save( );
        })
      }
    }
  }
};
handleResults();
