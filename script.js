'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2023-05-26T23:36:17.929Z',
    '2023-05-28T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

const formatDate = (date, locale) => {
  const countDaysDiff = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysDiff = countDaysDiff(new Date(), date);
  if (daysDiff === 0) return 'Today';
  if (daysDiff === 1) return 'Yesterday';
  if (daysDiff <= 7) return `${daysDiff} days ago`;

  // const dateDay = `${date.getDay()}`.padStart(2, 0);
  // const dateMonth = `${date.getMonth()}`.padStart(2, 0);
  // const dateYear = date.getFullYear();

  // return `${dateDay}/${dateMonth}/${dateYear}`;
  return new Intl.DateTimeFormat(locale).format(date);
};

const formatCurrency = (val, locale, currency) =>
  new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(val);

const displayMovements = function (acc, isSort = false) {
  containerMovements.innerHTML = '';

  const moves = isSort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  moves.forEach(function (move, idx) {
    const type = move > 0 ? 'deposit' : 'withdrawal';

    const date = new Date(acc.movementsDates[idx]);
    const displayDate = formatDate(date, acc.locale);

    const formattedMov = formatCurrency(move, acc.locale, acc.currency);

    const html = `
    <div class="movements__row">
      <div class="movements__type movements__type--${type}">${
      idx + 1
    } ${type}</div>
      <div class="movements__date">${displayDate}</div>
      <div class="movements__value">${formattedMov}</div>
    </div>`;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = formatCurrency(
    acc.balance,
    acc.locale,
    acc.currency
  );
};

const calcDisplaySummary = acc => {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((total, mov) => total + mov, 0);

  labelSumIn.textContent = formatCurrency(incomes, acc.locale, acc.currency);

  const outcomes = acc.movements
    .filter(mov => mov < 0)
    .reduce((total, mov) => total + mov, 0);

  labelSumOut.textContent = formatCurrency(outcomes, acc.locale, acc.currency);

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((intr, idx, arr) => intr >= 1)
    .reduce((total, intr) => total + intr, 0);

  labelSumInterest.textContent = formatCurrency(
    interest,
    acc.locale,
    acc.currency
  );
};

const createUsernames = function (accs) {
  accs.forEach(function (a) {
    a.username = a.owner
      .toLowerCase()
      .split(' ')
      .map(u => u.at(0))
      .join('');
  });
};

const updateUI = loginAccount => {
  // Display movements
  displayMovements(loginAccount);

  // Display balance
  calcDisplayBalance(loginAccount);

  // Display summary
  calcDisplaySummary(loginAccount);
};

createUsernames(accounts);

const startTimer = () => {
  const countdown = () => {
    let min = String(Math.trunc(remainingTime / 60)).padStart(2, 0);
    let sec = String(remainingTime % 60).padStart(2, 0);
    labelTimer.textContent = `${min}:${sec}`;

    // When touching 0 sec, logout user
    if (remainingTime === 0) {
      clearInterval(timer);
      labelWelcome.textContent = 'Log in to get started';
      containerApp.style.opacity = 0;
    }

    // Print remaining time to UI
    remainingTime -= 1;
  };
  // Set time to 5 mins
  let remainingTime = 300;

  // Call the timer every seconds
  countdown();
  const timer = setInterval(countdown, 1000);
  return timer;
};

// EVENT HANDLERS

let loginAccount, timer;

// Fake our login
// loginAccount = account1;
// updateUI(loginAccount);
// containerApp.style.opacity = 1;

// HOW TO LOGIN
// username: js, password: 1111

btnLogin.addEventListener('click', event => {
  event.preventDefault();

  loginAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );

  if (loginAccount?.pin === Number(inputLoginPin.value)) {
    // Display UI and the welcome message
    containerApp.style.opacity = 1;
    labelWelcome.textContent = `Welcome back, ${
      loginAccount.owner.split(' ')[0]
    }!`; // only the first Name

    const date = new Date();
    const options = {
      hour: 'numeric',
      minutes: 'numeric',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      weekday: 'short',
    };
    // const locale = navigator.language;
    // console.log(locale);

    labelDate.textContent = new Intl.DateTimeFormat(
      loginAccount.locale,
      options
    ).format(date);

    // const date = new Date();
    // const dateDay = `${date.getDay()}`.padStart(2, 0);
    // const dateMonth = `${date.getMonth()}`.padStart(2, 0);
    // const dateYear = date.getFullYear();
    // const dateHour = `${date.getHours()}`.padStart(2, 0);
    // const dateMin = `${date.getMinutes()}`.padStart(2, 0);
    // labelDate.textContent = `${dateDay}/${dateMonth}/${dateYear}, ${dateHour}:${dateMin}`;

    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    // check if a timer already exists
    if (timer) clearInterval(timer);
    timer = startTimer();

    updateUI(loginAccount);
  }
});

btnTransfer.addEventListener('click', event => {
  event.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    amount < loginAccount.balance &&
    receiverAcc?.username !== loginAccount.username
  ) {
    // Transferring an amount
    loginAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    // Add transfer date
    loginAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    updateUI(loginAccount);

    // Reset the timer
    clearInterval(timer);
    timer = startTimer();
  }
});

btnLoan.addEventListener('click', event => {
  event.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && loginAccount.movements.some(mov => mov >= 0.1 * amount)) {
    // Set a duration for loan
    setTimeout(() => {
      // Add movement
      loginAccount.movements.push(amount);

      loginAccount.movementsDates.push(new Date().toISOString());

      updateUI(loginAccount);
    }, 3000);
  }
  inputLoanAmount.value = '';

  clearInterval(timer);
  timer = startTimer();
});

btnClose.addEventListener('click', event => {
  event.preventDefault();

  if (
    loginAccount.username === inputCloseUsername.value &&
    +inputClosePin.value === loginAccount.pin
  ) {
    const idx = accounts.findIndex(
      acc => acc.username === loginAccount.username
    );

    accounts.splice(idx, 1);
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

let isSort = false;
btnSort.addEventListener('click', event => {
  event.preventDefault();
  displayMovements(loginAccount, !isSort);
  isSort = !isSort;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

// console.log(23 === 23.0);
// console.log(0.1 + 0.2);
// console.log(0.1 + 0.2 === 0.3);

// // CONVERSION
// console.log(Number('23'));
// console.log(+'23');

// // PARSING
// console.log(Number.parseInt('30px', 10));
// console.log(Number.parseInt('ep23', 10));

// console.log(Number.parseInt('  2.5rem'));
// console.log(Number.parseFloat(' 2.5rem  '));

// console.log(Number.isNaN('rye20'));
// console.log(Number.isNaN('17agus'));
// console.log(Number.isNaN(+'20x'));
// console.log(Number.isNaN(23 / 0));

// // Checking if the value is a number
// console.log(Number.isFinite(230));
// console.log(Number.isFinite('20'));
// console.log(Number.isFinite(+'20x'));

// console.log(Number.isInteger(23));
// console.log(Number.isInteger(23.2));

// console.log(Math.sqrt(25));
// console.log(Math.max(4, 6, 3, 1, 10, 434, 284, 38));
// console.log(Math.min(4, 6, 3, 1, 10, 434, 284, 38));

// console.log(Math.PI * Number.parseFloat('10px') ** 2);
// console.log(Math.trunc(Math.random() * 6)) + 1;

// const randomInt = (min, max) =>
//   Math.floor(Math.random() * (max - min) + 1) + min;
// console.log(randomInt(10, 20));

// console.log(Math.trunc(20.65));
// console.log(Math.floor('23.9'));
// console.log(Math.floor(-2.6));
// console.log(Math.floor(-2.1));

// // Rounding decimals
// console.log((2.7).toFixed(3));
// console.log((2.755344).toFixed(3));

// console.log(5 % 2);

// const isEven = n => n % 2 === 0;
// console.log(isEven(10));

// labelBalance.addEventListener('click', () => {
//   [...document.querySelectorAll('.movements__row')].forEach(function (
//     row,
//     idx
//   ) {
//     if (idx % 2 === 0) row.style.backgroundColor = 'orangered';
//     if (idx % 3 === 0) row.style.backgroundColor = 'blue';
//   });
// });

// Numeric Separators
// const diameter = 289_473_290_000;
// console.log(diameter);

// const priceCents = 345_990;
// console.log(priceCents);

// const transferFee = 15_00;
// const goodFee = 12.5_01;
// console.log(transferFee);
// console.log(goodFee);

// console.log(2 ** 53 - 1);
// console.log(Number.MAX_SAFE_INTEGER);
// console.log(2 ** 53 + 1);

// // BIG INT
// console.log(4237423901984329832324325254n);
// console.log(BigInt(4237423901984329832324325254));

// console.log(10000n + 10000n);
// console.log(3257238952534663463n * 52398237945543535n);
// console.log(20n === 20);

// Create a date
// const now = new Date();
// console.log(now);

// console.log(new Date('May 29 2023 08:18:21'));
// console.log(new Date('May 29, 2023'));
// console.log(new Date(account1.movementsDates[0]));
// console.log(new Date(2023, 9, 10, 21, 25, 5));
// console.log(new Date(0));

// Working with dates
// const future = new Date(2037, 10, 19, 15, 23);
// console.log(future);
// console.log(future.getFullYear());
// console.log(future.getMonth());
// console.log(future.getDate());
// console.log(future.getDay());
// console.log(future.getHours());
// console.log(future.toISOString());
// console.log(future.getTime());
// console.log(new Date(2142231780000));

// future.setFullYear(2040);
// console.log(future);

// console.log(+future);

// const daysDiff = (date1, date2) =>
//   Math.abs(date2 - date1) / (1000 * 60 * 60 * 24);
// console.log(daysDiff(new Date(2023, 3, 14), new Date(2023, 3, 24)));

// const num = 2337249.374;

// const options = {
//   style: 'currency',
//   unit: 'celsius',
//   currency: 'EUR',
//   // useGrouping: false,
// };

// console.log('US: ' + new Intl.NumberFormat('en-US', options).format(num));
// console.log('GER: ' + new Intl.NumberFormat('de-DE', options).format(num));
// console.log('SYR: ' + new Intl.NumberFormat('ar-SY', options).format(num));
// console.log(
//   navigator.language +
//     ' ' +
//     new Intl.NumberFormat(navigator.language, options).format(num)
// );

// const ingredients = ['olives', 'spinach'];

// // ing1 , ing2 -> arguments ('olives', 'spinach')
// const pizzaTimer = setTimeout(
//   (ing1, ing2) => console.log(`Here is ur pizza with ${ing1} and ${ing2}`),
//   3000,
//   ...ingredients
// );
// console.log('Waiting for pizza..');

// if (ingredients.includes('spinach')) clearTimeout(pizzaTimer);

// setInterval(function () {
//   const now = new Date();
//   console.log(`${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`);
// }, 2000);
