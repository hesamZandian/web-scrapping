const puppeteer = require('puppeteer')
const fs = require('fs')
const screenshot = 'divar.png'

try {
    (async () => {
        const browser = await puppeteer.launch({
             headless: true
            })
        const page = await browser.newPage()
        await page.setViewport({ width: 1280, height: 800 })
        await page.goto('https://bit.ly/2x78hsc', { waitUntil: 'networkidle2' })

        // change the grid view to content
        await page.click(' div.filter-option-container > div.ui.card.option-box > div > button:nth-child(2)')
        await page.waitForSelector('.post-card-detailed')
        const posts = await page.$$('.post-card-detailed > .post-card-link')
        const results = []
        posts.map(post => {

        })
        // take screenshot from every new tab item
        let i = 0
        for(let post of posts) {
            const  titleElement = await post.$('h2')
            const title = titleElement ? (await (await titleElement.getProperty('innerText')).jsonValue()).split('..')[0] : ''
            const detialsElement = await post.$('.content-column > p')
            const details = detialsElement ? (await (await detialsElement.getProperty('innerText')).jsonValue()) : ''
            const priceElement = await post.$('label.item')
            const price = priceElement ? (await (await priceElement.getProperty('innerText')).jsonValue()) : ''
            const addressElement = await post.$('div > label')
            const address = addressElement ? (await (await addressElement.getProperty('innerText')).jsonValue()) : ''

            // nagivate to each post page and get the phone
            const hrefValue = await (await post.getProperty('href')).jsonValue()
            const newPage = await browser.newPage()
            await newPage.setViewport({ width: 1280, height: 800 })
            await newPage.goto(hrefValue)
            const contactBtn = await newPage.waitForSelector('.get-contact')
            await contactBtn.click()
            let phone = ''
            const agreeBtn = await newPage.$('.divar-modal-footer > button')
            await agreeBtn.click()
            await newPage.$('.contact-active')
            const phoneHandler = await newPage.waitForSelector('.contact-active > div > a', { timeout: 3000 })
            phone = (await (await phoneHandler.getProperty('href')).jsonValue()).slice(-11)
            results.push({
                title,
                details,
                price,
                address,
                phone
            })
            await newPage.screenshot({ path: `${i++}${screenshot}` })
            await newPage.close()
        }
        fs.writeFile("Divar.json", JSON.stringify(results), "UTF8", () => {
            console.log("File has been created.");
        })
    })()
} catch (err) {
    console.error(err)
}
