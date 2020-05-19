const puppeteer = require('puppeteer');
const fs = require('fs');


(async () => {
  const browser = await puppeteer.launch({ headless: false });
  await browser.defaultBrowserContext().overridePermissions('C:/Users/JoshA/Desktop/dev/projects/midiplex-core/sandbox/sandbox.html', ['midi', 'midi-sysex']);
  const page = await browser.newPage();

  const chalk = require('chalk')
  page
    .on('console', message => {
      const type = message.type().substr(0, 3).toUpperCase()
      const colors = {
        LOG: text => text,
        ERR: chalk.red,
        WAR: chalk.yellow,
        INF: chalk.cyan
      }
      const color = colors[type] || chalk.blue
      console.log(color(`${type} ${message.text()}`))
    })
    .on('pageerror', ({ message }) => console.log(chalk.red(message)))
    .on('response', response =>
      console.log(chalk.green(`${response.status()} ${response.url()}`)))
    .on('requestfailed', request =>
      console.log(chalk.magenta(`${request.failure().errorText} ${request.url()}`)))


  await page.goto('C:/Users/JoshA/Desktop/dev/projects/midiplex-core/sandbox/sandbox.html');
  await page.evaluate(function(){
    return navigator.requestMIDIAccess().then(console.log).catch(console.error);
  })
  





  

//  try {
//     await page.goto('C:\\Users\\dev\\Desktop\\midiplex-core\\sandbox\\sandbox.html');
//  } catch (err) {
//      console.log(err);
//  }


  try {

    //await page.goto('C:/Users/dev/Desktop/midiplex-core/sandbox/sandbox.html');

    //await page.evaluate(fs.readFileSync('../dist/midiplex.js', 'utf8'));
    //await page.evaluate(fs.readFileSync('script.js', 'utf8'));
  } catch (err) {
    console.log(err);
  }


  //await browser.close();
})();