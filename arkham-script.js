let tradeCount = 0;
let entryPrice = null;
let stopTrading = false;

const MIN_PRICE = 123;


/////////////////////////


const MIN_WAIT_MS = 300;
const MAX_WAIT_MS = 1000;;
const MIN_SWITCH_MS = 500;
const MAX_SWITCH_MS = 3000;

const BUY_LIMIT_TIME = 360;

/////////////////////////


const LIMIT_ORDER_TYPE = "LIMIT";
const MARKET_ORDER_TYPE = "MARKET";

const BUY_TYPE = "BUY";
const SELL_TYPE = "SELL";


/////////////////////////


const MAIN_WRAPPER_CLASS_ID = 'ae282d4';


const ORDER_TYPE_WRAPPER_CLASS_NAME = "a77eb31";

const BUY_SECTION_ELEMENT_ID = "tab-buy";
const SELL_SECTION_ELEMENT_ID = "tab-sell";

const BOOK_BUY_ELEMENT_CLASS = "a7b9536";
const BOOK_SELL_ELEMENT_CLASS = "a1b6b92";

const SIZE_WRAPPER_CLASS_NAME = "a4baac8";

const BUY_BUTTON_ELEMENT_CLASS_NAME = "ad3fb6d";
const SELL_BUTTON_ELEMENT_CLASS_NAME = "aefd9a5";

const NO_ORDERS_ELEMENT_CLASS_NAME = "grid text-xs overflow-auto adb5aed";
const DEFAULT_CHILDREN_CLASS_NAMES = ['aa6ba26', 'af5ae96'];

const CANCEL_BUTTON_WRAPPER_CLASS_NAME = 'abf4b53';


/////////////////////////


const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getRandomWait = (min, max) => Math.floor(Math.random() * max + min);

const getValueByType = (type, buyValue, sellValue) => {
  if (type === BUY_TYPE) {
    return buyValue;
  }

  if (type === SELL_TYPE) {
    return sellValue;
  }
}


/////////////////////////


function playBeep() {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.type = "triangle"; // 'sine', 'square', 'sawtooth', 'triangle'
  oscillator.frequency.setValueAtTime(660, audioContext.currentTime); // Початкова частота
  oscillator.frequency.exponentialRampToValueAtTime(440, audioContext.currentTime + 0.3); // Плавне зниження частоти

  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime); // Початкова гучність
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5); // Плавне затухання

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.5); // Тривалість 0.5 секунди
}


/////////////////////////

async function selectOrderType(type) {
  const [orderTypeWrapperElement] = document.getElementsByClassName(ORDER_TYPE_WRAPPER_CLASS_NAME);
  const orderTypeElement = Array.from(orderTypeWrapperElement.children).find((element) => element.innerText === type);

  if (orderTypeElement) {
    orderTypeElement.click();
    await sleep(getRandomWait(MIN_WAIT_MS, MAX_WAIT_MS));
  }
}


/////////////////////////

const openSectionByTypeID = async (type) => {
  let id = getValueByType(type, BUY_SECTION_ELEMENT_ID, SELL_SECTION_ELEMENT_ID);

  const element = document.getElementById(id);

  if (element) {
    element.click();
    await sleep(getRandomWait(MIN_WAIT_MS, MAX_WAIT_MS));
  }
}


/////////////////////////////////

const setOrderBookPriceByWrapperClassName = async (type) => {
  let className = getValueByType(type, BOOK_BUY_ELEMENT_CLASS, BOOK_SELL_ELEMENT_CLASS);

  const buyWrapperElements = document.getElementsByClassName(className);
  const [buyWrapperElement] = Array.from(buyWrapperElements).filter((element) => element.children.length);
  const firstBuyElement = buyWrapperElement.firstChild;
  const [buttonElement] = firstBuyElement.querySelectorAll('button');

  if (buttonElement) {
    if (type === BUY_TYPE) {
      if (MIN_PRICE >= +buttonElement.innerHTML) {
        await new Promise(() => console.log("ALERT: PRICE IS TOO LOW"));
      }

      console.log("THE ORDER BOOK BUY PRICE", +buttonElement.innerHTML);
      entryPrice = +buttonElement.innerHTML;
      buttonElement.click();
    }

    if (type === SELL_TYPE) {
      if (MIN_PRICE >= +buttonElement.innerHTML) {
        await new Promise(() => console.log("ALERT: PRICE IS TOO LOW"));
      }

      if (entryPrice > +buttonElement.innerHTML) {
        await waitUntilSellPriceIncrease(buttonElement);
      } else {
        console.log("THE ORDER BOOK SELL PRICE", +buttonElement.innerHTML);
        buttonElement.click();
      }

      entryPrice = null;
    }
  }
}

const waitUntilSellPriceIncrease = async (element) => {
  let inProgress = true;

  while (inProgress) {
    await sleep(1000);
    console.log("MS ----- WAIT UNTIL SELL PRICE INCREASE");

    if (entryPrice <= +element.innerHTML) {
      console.log("THE ORDER BOOK SELL PRICE", +element.innerHTML);
      inProgress = false;
      element.click();
    }
  }

  console.log("WAIT UNTIL SELL PRICE INCREASE ----- ENDED");
};


/////////////////////////


const setMaxSizeByWrapperClassName = async (className) => {
  const [wrapperElement] = document.getElementsByClassName(className);

  if (wrapperElement) {
    wrapperElement.lastElementChild.click();
    await sleep(getRandomWait(MIN_WAIT_MS, MAX_WAIT_MS));
  }
}


//////////////////////////////


const makeAnOrder = (type) => {
  let className = getValueByType(type, BUY_BUTTON_ELEMENT_CLASS_NAME, SELL_BUTTON_ELEMENT_CLASS_NAME);
  const [wrapperElement] = document.getElementsByClassName(className);

  if (wrapperElement) {
    wrapperElement.click();
  }
}


/////////////////////////


const executeTradeByType = async (type) => {
  await openSectionByTypeID(type);
  await selectOrderType(LIMIT_ORDER_TYPE);

  await setMaxSizeByWrapperClassName(SIZE_WRAPPER_CLASS_NAME);
  await setMaxSizeByWrapperClassName(SIZE_WRAPPER_CLASS_NAME);
  await setOrderBookPriceByWrapperClassName(type);
  makeAnOrder(type);
  await sleep(700);
};


/////////////////////////


const checkNoOrders = () => {
  const wrapperElements = document.getElementsByClassName(NO_ORDERS_ELEMENT_CLASS_NAME);
  const wrapperElement = Array.from(wrapperElements).at(-1);
  const children = Array.from(wrapperElement.children).filter((item) => !DEFAULT_CHILDREN_CLASS_NAMES.includes(item.className));

  return !children.length;
}


/////////////////////////


const waitUntilFilled = async (type) => {
  let inProgress = true;
  let seconds = 0;

  while (inProgress) {
    await sleep(1000);
    ++seconds;

    if (checkNoOrders()) {
      inProgress = false;
      this.playBeep();
    }

    console.log("MS ----- WAIT UNTIL FILLED");


    if (type === BUY_TYPE && BUY_LIMIT_TIME <= seconds) {
      this.cancelActiveOrders();
      inProgress = false;

      await sleep(getRandomWait(15000, 20000));
      await executeTradeByType(BUY_TYPE);
      await waitUntilFilled(BUY_TYPE);
    }
  }
};

function cancelActiveOrders() {
  const [mainWrapperElement] = document.getElementsByClassName(MAIN_WRAPPER_CLASS_ID);
  const cancelButtonWrapperElements = mainWrapperElement.getElementsByClassName(CANCEL_BUTTON_WRAPPER_CLASS_NAME);

  Array.from(cancelButtonWrapperElements).map((element) => {
    const cancelButtonElement = element.firstElementChild;
    cancelButtonElement.click();
  });

  console.log("ACTIVE ORDERS HAVE BEEN CANCELED");
}


/////////////////////////


const performTradeCycle = async () => {
  try {
    await executeTradeByType(BUY_TYPE);
    await waitUntilFilled(BUY_TYPE);
    await sleep(getRandomWait(MIN_SWITCH_MS, MAX_SWITCH_MS));

    await executeTradeByType(SELL_TYPE);
    await waitUntilFilled(SELL_TYPE);
    await sleep(getRandomWait(MIN_SWITCH_MS, MAX_SWITCH_MS));

  } catch (error) {
    console.error("ERROR:", error);
  }
};

const startTrading = async () => {
  console.log("TRADING ----- STARTED");
  console.log("__________________________________________________");
  await sleep(1000);

  while (true && !stopTrading) {
    await performTradeCycle();
    tradeCount++;
    console.log("Trade count", tradeCount);
    console.log("__________________________________________________");
    await sleep(getRandomWait(30000, 50000));
  }
};

startTrading();
