/* Config */
const RSI 	   = require('technicalindicators').RSI;
	  chalk    = require('chalk');
	  prHelp   = chalk.hex('#add8e6');
      prompt   = require('prompt-sync')();
	  readline = require('readline');
	  Binance  = require('node-binance-api');
	  binance  = new Binance().options({
	  	  APIKEY: 'l5BTF4kT8B9sBapyUEORqF4A1HaLrqkJpGAufjKoCHP5uHbTg3RjHId7vVY8SuLT',
	  	  APISECRET: 'nFeByfPBKhPjz3IVHUB3UTz6WaUOYYLp5xMKWOgIchAjCbAG0gZp4VB0wY9fwQQg'
	  });
var rl = readline.createInterface({input: process.stdin, output: process.stdout});
    symbol     = "ETHUSDT";
    interval   = "1m";
    botVersion = "v0.2.1";
	orangeHex  = "#FF8C00";
    wallet = {
		USDT : 10000,
		ETH : 0,
		ltcost : 0,
		trades: 0
	};
    rsimin = 31, rsimax = 62;

/* UI */
printFlukeBotIntro();
printHelp();
setTimeout(function(){ calculateETHRSI(); }, 50);
setInterval(() => {
	calculateETHRSI();
}, 20000)
waitForUserInput();

/* Helper functions */
function waitForUserInput() {
	rl.question("", function(answer) {
		if (answer == 1 || answer == 'wallet')
			printWallet();
		else if (answer == 2 || answer == 'rsi') 
			calculateETHRSI();
		else if (answer == 3 || answer == 'usdtoeth' || answer == 'buy')
			manuallyConvertUSDTtoETH();
		else if (answer == 4 || answer == 'ethtousd' || answer == 'sell')
			manuallyConvertETHtoUSDT();
		else if (answer == 5 || answer == 'help')
			printHelp();
    	waitForUserInput();
  	});
}

function getPrice(symbol,interval) 
{
	binance.candlesticks(symbol, interval, (error, ticks, symbol) => {
		let last_tick = ticks[ticks.length - 1];
		let [time, open, high, low, close, volume, closeTime, assetVolume, trades, buyBaseVolume, buyAssetVolume, ignored] = last_tick;
		let finPrice = close;
		return finPrice;
	});
}

function printFlukeBotIntro()
{
	var flukeColour = "#fc7f03";
	console.log(chalk.hex(flukeColour)('┌────────────────────────────────────────────────┐'));
	console.log(chalk.hex(flukeColour)('│               FlukeBot  '+botVersion+'                 │'));
	console.log(chalk.hex(flukeColour)('└────────────────────────────────────────────────┘'));
}

function printHelp()
{
	console.log(prHelp('┌───────────────────────────────────────────┐'));
	console.log(prHelp('│         Commands                          │'));
	console.log(prHelp('│                                           │'));
	console.log(prHelp('│    [1]  Display Wallet                    │'));
	console.log(prHelp('│    [2]  Display Price and RSI             │'));
	console.log(prHelp('│    [3]  Buy                               │'));
	console.log(prHelp('│    [4]  Sell                              │'));
	console.log(prHelp('│    [5]  Display Help                      │'));
	console.log(prHelp('└───────────────────────────────────────────┘'));
}

function printWallet()
{
	binance.candlesticks("ETHUSDT", "1m", (error, ticks, symbol) => {
		let last_tick = ticks[ticks.length - 1];
		let [time, open, high, low, close, volume, closeTime, assetVolume, trades, buyBaseVolume, buyAssetVolume, ignored] = last_tick;
		let finPrice = close;
		let walletUSDT = parseFloat(wallet.USDT);
		let walletETH  = parseFloat(wallet.ETH);
		let walletltcost = "";
		if (wallet.ltcost == 0) walletltcost = "N/A";
		else walletltcost  = parseFloat(wallet.ltcost).toFixed(2) + " ETHUSDT";
		let total = walletUSDT + walletETH*finPrice;
		let usdttabs = '\t'
		if (walletUSDT < 99) usdttabs = '\t\t';
		console.log(chalk.green('│ USDT  : ' + walletUSDT.toFixed(2) + usdttabs + 'Last Buy Price : ' + walletltcost));
		console.log(chalk.green('│ ETH   : ' + walletETH.toFixed(5) + '\t\tTrades : ' + wallet.trades));
		console.log(chalk.green('│ Total : ' + total.toFixed(2)));
	});
}

function manuallyConvertUSDTtoETH()
{
	console.log('How much? (in USDT)');
	var quantity = prompt('');
	if (quantity == 'all') quantity = wallet.USDT;
	else if (quantity == 0) return 1;
	convertUSDTtoETH(quantity);
}

function manuallyConvertETHtoUSDT()
{
	console.log('How much? (in ETH)');
	var quantity = prompt('');
	if (quantity == 'all') quantity = wallet.ETH;
	else if (quantity == 0) return 1;
	convertETHtoUSDT(quantity);
}

function convertUSDTtoETH(quantity) 
{
	if (quantity > wallet.USDT) {
		impAlert("Error: insufficient funds");
		return 1;
	} 
	else if (quantity < 0) {
		impAlert("Quantity cannot be negative");
		return 1;
	}
	else {
		binance.candlesticks(symbol, interval, (error, ticks, symbol) => {
			let last_tick = ticks[ticks.length - 1];
			let [time, open, high, low, close, volume, closeTime, assetVolume, trades, buyBaseVolume, buyAssetVolume, ignored] = last_tick;
			let finPrice = close;
			let eth = quantity / finPrice;
			let newUSDT = wallet.USDT - quantity;
			let newETH  = wallet.ETH  + eth;
			if (newUSDT < 0 || newETH < 0) {
				impAlert("Error: new balance negative.")
				return 1;
			}
			let impString = parseFloat(quantity).toFixed(2)+ " USDT => "+parseFloat(eth).toFixed(4)+" ETH";
			console.log(chalk.hex(orangeHex)("│ ") + chalk.bgRed("Buy alert!") + chalk.red('  @ ' + parseFloat(finPrice).toFixed(2) + ' ETHUSDT'));
			impAlert(impString);
			wallet.USDT = newUSDT;
			wallet.ETH  = newETH;
			wallet.ltcost = finPrice;
			wallet.trades++;
			return finPrice;
		});
	}
}

function convertETHtoUSDT(quantity)
{
	if (quantity > wallet.ETH) {
		impAlert("Error: insufficient funds");
		return 1;
	}
	else if (quantity < 0) {
		impAlert("Quantity cannot be negative");
		return 1;
	}
	else {
		binance.candlesticks(symbol, interval, (error, ticks, symbol) => {
			let last_tick = ticks[ticks.length - 1];
			let [time, open, high, low, close, volume, closeTime, assetVolume, trades, buyBaseVolume, buyAssetVolume, ignored] = last_tick;
			let finPrice = close;
			let USDT = quantity * finPrice;
			let impString = parseFloat(quantity).toFixed(2)+ " ETH => "+parseFloat(USDT).toFixed(4)+" USDT";
			console.log(chalk.hex(orangeHex)("│ ") + chalk.bgRed("Sell alert!") + chalk.red('  @' + parseFloat(finPrice).toFixed(2) + ' ETHUSDT'));
			impAlert(impString);
			wallet.ETH = wallet.ETH - quantity;
			wallet.USDT  = wallet.USDT  + USDT;
			wallet.trades++;
			return finPrice;
		});
	}
}

function rsiCheck(rsifinal)
{
	if (rsifinal < rsimin) {
    	console.log(chalk.red('\tOversold! RSI < ' + rsimin));
    	if (wallet.USDT > 0) convertUSDTtoETH(wallet.USDT);
	}
    else if (rsifinal > rsimax) {
    	console.log(chalk.red('\tOverbought! RSI > ' + rsimax));
    	if (wallet.ETH > 0) convertETHtoUSDT(wallet.ETH);
    }
    else console.log(); // Reset new line
}

function impAlert(string)
{
	console.log(chalk.hex(orangeHex)("│ ")+chalk.red(string));
}

function calculateETHRSI() 
{
    let listClose = [];
    let period    = 14;
    let finPrice  = 0;
    let current_time   = Date.now();
    
    binance.candlesticks("ETHUSDT", interval, (error, ticks, symbol) => {
        for (i = 0; i < ticks.length; i++) {
            let last_tick = ticks[i];
            let [time, open, high, low, close, volume, closeTime, assetVolume, trades, buyBaseVolume, buyAssetVolume, ignored] = last_tick;
            listClose.push(close);
            finPrice = close;
        }
		var inputRSI = {
			values : listClose.map(i => Number(i)),
			period : period - 1
		};
        let rsiarr = RSI.calculate(inputRSI);
        let rsifinal = parseFloat(JSON.stringify(rsiarr[rsiarr.length - 1])).toFixed(2); 
    	process.stdout.write(chalk.hex(orangeHex)("│ RSI: "+rsifinal+"\t"+symbol+': '+parseFloat(finPrice).toFixed(2)));
    	rsiCheck(rsifinal);
        return rsifinal;
    }, {
        limit: period,
        endTime: current_time
    });
}

function convertTimestamp(timestamp) 
{
    var d = new Date(timestamp), // Convert the passed timestamp to milliseconds
        yyyy = d.getFullYear(),
        mm   = ('0' + (d.getMonth() + 1)).slice(-2),  // Months are zero based. Add leading 0.
        dd   = ('0' + d.getDate()).slice(-2),         // Add leading 0.
        hh   = d.getHours(),
        h    = hh,
        min  = ('0' + d.getMinutes()).slice(-2),     // Add leading 0.
        ampm = 'AM',
        time;

    if (hh > 12) {
        h = hh - 12;
        ampm = 'PM';
    } 
    else if (hh === 12) {
        h = 12;
        ampm = 'PM';
    } 
    else if (hh == 0)
        h = 12;

    // ie: 2014-03-24, 3:00 PM
    time = yyyy + '-' + mm + '-' + dd + ', ' + h + ':' + min + ' ' + ampm;
    return time;
}
