const MIN_PRICE = 2600;


/////////////////////////

const MIN_WAIT_MS = 300;
const MAX_WAIT_MS = 1000;;
const MIN_SWITCH_MS = 500;
const MAX_SWITCH_MS = 3000;

const BUY_TYPE = "BUY";
const SELL_TYPE = "SELL";

let tradeCount = 0;
let buyPrice = null;
let stopTrading = false;

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


const BUY_SECTION_ELEMENT_ID = "tab-buy";
const SELL_SECTION_ELEMENT_ID = "tab-sell";

const openSectionByTypeID = async (type) => {
  let id = getValueByType(type, BUY_SECTION_ELEMENT_ID, SELL_SECTION_ELEMENT_ID);

  const element = document.getElementById(id);

  if (element) {
    element.click();
    await sleep(getRandomWait(MIN_WAIT_MS, MAX_WAIT_MS));
  }
}


/////////////////////////////////


const BOOK_BUY_ELEMENT_CLASS = "a95380a";
const BOOK_SELL_ELEMENT_CLASS = "a3a433c";

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
      buyPrice = +buttonElement.innerHTML;
      buttonElement.click();
    }

    if (type === SELL_TYPE) {
      if (MIN_PRICE >= +buttonElement.innerHTML) {
        await new Promise(() => console.log("ALERT: PRICE IS TOO LOW"));
      }

      if (buyPrice > +buttonElement.innerHTML) {
        await waitUntilSellPriceIncrease(buttonElement);
      } else {
        console.log("THE ORDER BOOK SELL PRICE", +buttonElement.innerHTML);
        buttonElement.click();
      }

      buyPrice = null;
    }
  }
}

const waitUntilSellPriceIncrease = async (element) => {
  let inProgress = true;

  while (inProgress) {
    await sleep(1000);
    console.log("MS ----- WAIT UNTIL SELL PRICE INCREASE");

    if (buyPrice <= +element.innerHTML) {
      console.log("THE ORDER BOOK SELL PRICE", +element.innerHTML);
      inProgress = false;
      element.click();
    }
  }

  console.log("WAIT UNTIL SELL PRICE INCREASE ----- ENDED");
};


/////////////////////////


const SIZE_WRAPPER_CLASS_NAME = "a99be89";

const setMaxSizeByWrapperClassName = async (className) => {
  const [wrapperElement] = document.getElementsByClassName(className);

  if (wrapperElement) {
    wrapperElement.lastElementChild.click();
    await sleep(getRandomWait(MIN_WAIT_MS, MAX_WAIT_MS));
  }
}


//////////////////////////////

const BUY_BUTTON_ELEMENT_CLASS_NAME = "a0ac8d4";
const SELL_BUTTON_ELEMENT_CLASS_NAME = "a11fd07";

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
  await setMaxSizeByWrapperClassName(SIZE_WRAPPER_CLASS_NAME);
  await setOrderBookPriceByWrapperClassName(type);
  makeAnOrder(type);
  await sleep(700);
};


/////////////////////////


const NO_ORDERS_ELEMENT_CLASS_NAME = "grid text-xs overflow-auto ac2f81c";
const DEFAULT_CHILDREN_CLASS_NAMES = ['a834c0a', 'abed4d3'];

const checkNoOrders = () => {
  const wrapperElements = document.getElementsByClassName(NO_ORDERS_ELEMENT_CLASS_NAME);
  const wrapperElement = Array.from(wrapperElements).at(-1);
  const children = Array.from(wrapperElement.children).filter((item) => !DEFAULT_CHILDREN_CLASS_NAMES.includes(item.className));

  return !children.length;
}


/////////////////////////


const waitUntilFilled = async () => {
  let inProgress = true;

  while (inProgress) {
    await sleep(1000);

    if (checkNoOrders()) {
      inProgress = false;
      this.playBeep();
    }

    console.log("MS ----- WAIT UNTIL FILLED");
  }
};


/////////////////////////


const performTradeCycle = async () => {
  try {

    await executeTradeByType(BUY_TYPE);
    await waitUntilFilled();
    await sleep(getRandomWait(MIN_SWITCH_MS, MAX_SWITCH_MS));

    await executeTradeByType(SELL_TYPE);
    await waitUntilFilled();
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
