"use strict";

//////////// INPUT DATA ////////////
const account1 = {
  owner: "Jonas Schmedtmann",
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    "2019-11-18T21:31:17.178Z",
    "2019-12-23T07:42:02.383Z",
    "2020-01-28T09:15:04.904Z",
    "2020-04-01T10:17:24.185Z",
    "2020-05-08T14:11:59.604Z",
    "2022-10-06T17:01:17.194Z",
    "2022-10-08T23:36:17.929Z",
    "2022-10-10T10:51:36.790Z",
  ],
  currency: "EUR",
  locale: "pt-PT", // de-DE
};

const account2 = {
  owner: "Jessica Davis",
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    "2019-11-01T13:15:33.035Z",
    "2019-11-30T09:48:16.867Z",
    "2019-12-25T06:04:23.907Z",
    "2020-01-25T14:18:46.235Z",
    "2020-02-05T16:33:06.386Z",
    "2020-04-10T14:43:26.374Z",
    "2020-06-25T18:49:59.371Z",
    "2020-07-26T12:01:20.894Z",
  ],
  currency: "USD",
  locale: "en-US",
};

const accounts = [account1, account2];

//////////// ELEMENTS ////////////
// LABEL
const labelWelcome = document.querySelector(".welcome");
const labelDate = document.querySelector(".date");
const labelBalance = document.querySelector(".balance__value");
const labelSumIn = document.querySelector(".summary__value--in");
const labelSumOut = document.querySelector(".summary__value--out");
const labelSumInterest = document.querySelector(".summary__value--interest");
const labelTimer = document.querySelector(".timer");
// CONTAINER
const containerApp = document.querySelector(".app");
const containerMovements = document.querySelector(".movements");
// BUTTON
const btnLogin = document.querySelector(".login__btn");
const btnTransfer = document.querySelector(".form__btn--transfer");
const btnLoan = document.querySelector(".form__btn--loan");
const btnClose = document.querySelector(".form__btn--close");
const btnSort = document.querySelector(".btn--sort");
// INPUT
const inputLoginUsername = document.querySelector(".login__input--user");
const inputLoginPin = document.querySelector(".login__input--pin");
const inputTransferTo = document.querySelector(".form__input--to");
const inputTransferAmount = document.querySelector(".form__input--amount");
const inputLoanAmount = document.querySelector(".form__input--loan-amount");
const inputCloseUsername = document.querySelector(".form__input--user");
const inputClosePin = document.querySelector(".form__input--pin");

//////////// FUNCTIONS ////////////
// SORT MOVEMENTS WITH DATES
const sortMovements = function (account) {
  const sortedMovs = [];
  const sortedDates = [];

  account.movements
    .map((mov, i) => [mov, account.movementsDates[i]])
    .sort((a, b) => a[0] - b[0])
    .forEach(el => {
      sortedMovs.push(el[0]);
      sortedDates.push(el[1]);
    });

  return [sortedMovs, sortedDates];
};

// FORMAT MOVEMENTS DATES
const formatMovementDate = function (date, locale) {
  // Calculating passed days
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysPassed = calcDaysPassed(new Date(), date);

  if (daysPassed === 0) return "Today";
  else if (daysPassed === 1) return "Yesterday";
  else if (daysPassed <= 7) return `${daysPassed} days ago`;
  else {
    // Create current date and time
    // const day = `${date.getDate()}`.padStart(2, 0);
    // const month = `${date.getMonth() + 1}`.padStart(2, 0);
    // const year = date.getFullYear();
    // return `${day}/${month}/${year}`;

    // Create current date and time with Internationalizing API
    return new Intl.DateTimeFormat(locale).format(date);
  }
};

// FORMAT CURRENCIES
const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(value);
};

// DISPLAY MOVEMENTS
const displayMovements = function (account, sort = false) {
  // Clear movements
  containerMovements.innerHTML = "";

  // Sort movements with dates
  const [movs, dates] = sort
    ? sortMovements(account)
    : [account.movements, account.movementsDates];

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? "deposit" : "withdrawal";

    // Display date
    const date = new Date(dates[i]);
    const displayDate = formatMovementDate(date, account.locale);

    // Format movements
    const formattedMov = formatCur(mov, account.locale, account.currency);

    // HTML
    const html = `
    <div class="movements__row">
      <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
      <div class="movements__date">${displayDate}</div>
      <div class="movements__value">${formattedMov}</div>
    </div>`;

    containerMovements.insertAdjacentHTML("afterbegin", html);
  });
};

// CALCULATE BALANCE
const calcDisplayBalance = function (account) {
  account.balance = account.movements.reduce((acc, mov) => acc + mov, 0);

  // Format balance
  labelBalance.textContent = formatCur(
    account.balance,
    account.locale,
    account.currency
  );
};

// CALCULATE SUMMARY
const calcDisplaySummary = function (account) {
  // Incomes
  const incomes = account.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatCur(incomes, account.locale, account.currency);

  // Out
  const out = account.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formatCur(
    Math.abs(out),
    account.locale,
    account.currency
  );

  // Interest
  const interest = account.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * account.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formatCur(
    interest,
    account.locale,
    account.currency
  );
};

// CREATE USERNAMES
const createUsernames = function (accounts) {
  accounts.forEach(function (account) {
    account.username = account.owner
      .toLowerCase()
      .split(" ")
      .map(name => name[0])
      .join("");
  });
};
createUsernames(accounts);

// UPDATE UI
const updateUI = function (account) {
  // Display movement
  displayMovements(account);

  // Display balance
  calcDisplayBalance(account);

  // Display summary
  calcDisplaySummary(account);
};

// LOGOUT TIMER
const startLogOutTimer = function () {
  // Set time to 5 minutes
  let time = 300;

  // Function
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);
    // In each call, print the remaining time to UI
    labelTimer.textContent = `${min}:${sec}`;

    // When 0 seconds, stop timer and log out user
    if (time === 0) {
      // Stop timer
      clearInterval(timer);
      // Hide UI
      labelWelcome.textContent = `Log in to get started`;
      containerApp.style.opacity = 0;
    }

    // Decrese 1s
    time--;
  };

  // Call the timer every second
  tick();
  const timer = setInterval(tick, 1000);

  // Return timer for clear it in next Login
  return timer;
};

//////////// EVENT HANDLERS ////////////
// GLOBAL VARIABLES
let currentAccount, timer;
let sorted = false;

// TEST CODE = FAKE ALWAYS LOGGED IN
// currentAccount = account1;
// updateUI(currentAccount);
// containerApp.style.opacity = 1;

// LOGIN
btnLogin.addEventListener("click", function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    account => account.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount?.pin === +inputLoginPin.value) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(" ")[0]
    }`;
    containerApp.style.opacity = 1;

    // Create current date and time
    // const now = new Date();
    // const day = `${now.getDate()}`.padStart(2, 0);
    // const month = `${now.getMonth() + 1}`.padStart(2, 0);
    // const year = now.getFullYear();
    // const hour = `${now.getHours()}`.padStart(2, 0);
    // const min = `${now.getMinutes()}`.padStart(2, 0);
    // labelDate.textContent = `${day}/${month}/${year}, ${hour}:${min}`;

    // Create current date and time with Internationalizing API
    const now = new Date();
    const options = {
      hour: "numeric",
      minute: "numeric",
      day: "numeric",
      month: "numeric",
      year: "numeric",
      // weekday: "long",
    };
    // const locale = navigator.language;
    // console.log(locale);

    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = "";
    inputLoginPin.blur();

    // Logout Timer
    // Clear previous timer
    // if (timer) clearInterval(timer);
    timer &&= clearInterval(timer);
    // New timer
    timer = startLogOutTimer();

    // Update UI
    updateUI(currentAccount);
  }
});

// TRANSFER MONEY
btnTransfer.addEventListener("click", function (e) {
  // Prevent form from submitting
  e.preventDefault();

  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    account => account.username === inputTransferTo.value
  );

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    // Add tranfer date
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    // Update UI
    updateUI(currentAccount);

    // Reset timer
    // Clear previous timer
    clearInterval(timer);
    // New timer
    timer = startLogOutTimer();
  }

  // Clear input fields
  inputTransferAmount.value = inputTransferTo.value = "";
});

// REQUEST LOAN
btnLoan.addEventListener("click", function (e) {
  // Prevent form from submitting
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov > amount * 0.1)) {
    setTimeout(function () {
      // Add movement
      currentAccount.movements.push(amount);

      // Add loan date
      currentAccount.movementsDates.push(new Date().toISOString());

      // Update UI
      updateUI(currentAccount);

      // Reset timer
      // Clear previous timer
      clearInterval(timer);
      // New timer
      timer = startLogOutTimer();
    }, 2500);
  }

  // Clear input field
  inputLoanAmount.value = "";
});

// CLOSE ACCOUNT
btnClose.addEventListener("click", function (e) {
  // Prevent form from submitting
  e.preventDefault();

  if (
    currentAccount.username === inputCloseUsername.value &&
    currentAccount.pin === +inputClosePin.value
  ) {
    const index = accounts.findIndex(
      account => account.username === currentAccount.username
    );
    console.log(index);

    // Close account
    accounts.splice(index, 1);

    // Hide UI
    labelWelcome.textContent = `Log in to get started`;
    containerApp.style.opacity = 0;
  }

  // Clear input fields
  inputCloseUsername.value = inputClosePin.value = "";
});

// SORT MOVEMENTS
btnSort.addEventListener("click", function (e) {
  // Prevent form from submitting
  e.preventDefault();

  // Sort movements
  displayMovements(currentAccount, !sorted);

  // Flip variable back
  sorted = !sorted;
});
