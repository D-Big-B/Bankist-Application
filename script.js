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
    '2020-07-11T23:36:17.929Z',
    '2020-07-12T10:51:36.790Z',
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

const logOutTimer = ()=>{
  let time = 120;

  const tick = ()=>{
    const min = String(Math.trunc(time/60)).padStart(2,0);
    const sec = String(time%60).padStart(2,0);
    labelTimer.textContent = `${min}:${sec}`;
     
     if(time === 0){
       containerApp.style.opacity = 0;
       labelWelcome.textContent = "Login to get started"
       clearInterval(timer);
     }
     time--;
    }
  tick();
  const timer = setInterval(tick,1000);

  return timer
}



const formatDate = (now,locale)=>{
  
  const calcDayPassed = (date1,date2)=> Math.round(Math.abs(date1-date2)/(1000*24*60*60))

  const daysPassed = calcDayPassed(new Date(),now);
  
  // const date = `${now.getDate()}`.padStart(2,0);
  // const month =  `${now.getMonth()}`.padStart(2,0);
  // const year = `${now.getFullYear()}`

 if(daysPassed === 0) return "Today";
 else if(daysPassed === 1 )return "Yesterday";
 else if(daysPassed <= 7) return `${daysPassed} days ago`;
 else return new Intl.DateTimeFormat(locale).format(new Date());

}

const formatCurrency = (value,currency,locale)=> new Intl.NumberFormat(locale,{
  style : "currency",
  currency : currency,
}).format(value)

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort ? acc.movements.slice().sort((a, b) => a - b) : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';
    const now = new Date(acc.movementsDates[i]);
    const displayDate = formatDate(now,acc.locale);

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
      <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formatCurrency(mov,acc.currency,acc.locale)}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = `${formatCurrency(acc.balance,acc.currency,acc.locale)}`;
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = `${formatCurrency(incomes,acc.currency,acc.locale)}`;

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = `${formatCurrency(out,acc.currency,acc.locale)}`;

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = `${formatCurrency(interest,acc.currency,acc.locale)}`;
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

///////////////////////////////////////
// Event handlers
let currentAccount,timer;

//Always login
// currentAccount = account1;
// containerApp.style.opacity = 100;
// updateUI(currentAccount);




btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    const  now = new Date();
    const options = {
      day : 'numeric',
      month : 'numeric',
      year : 'numeric',
      // weekday : 'long',
      hour : 'numeric',
      minute : 'numeric',
      
    };
    // const locale = navigator.language;
    
    labelDate.textContent = new Intl.
    DateTimeFormat(currentAccount.locale , options).format(now);

    // Clear input fields

    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    //enter date
    // Update UI
    
    updateUI(currentAccount);
    if(timer) clearInterval(timer);
    timer = logOutTimer();
  }
});



btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);
    currentAccount.movementsDates.push(new Date().toISOString())
    receiverAcc.movementsDates.push(new Date().toISOString())

    // Update UI
    updateUI(currentAccount);

    clearInterval(timer);
    timer = logOutTimer();
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
   setTimeout( function() {// Add movement
    currentAccount.movements.push(amount);
    currentAccount.movementsDates.push(new Date().toISOString())

    // Update UI
    updateUI(currentAccount);
  inputLoanAmount.value = '';
  clearInterval(timer);
  timer = logOutTimer();

   },5000)
  }
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES
// labelBalance.addEventListener('click',()=>{
//   [...document.querySelectorAll(".movements__row")].forEach((row , i)=>{
//     if(i%2===0)
//       row.style.background = "orangered";
//   })
// })

// console.log(new Date(account1.movementsDates[0]));

// const no = 89745632.324;
// const options = {
//   style:"percent",
//   currency : "EUR"
// }
// const formatted = new Intl.NumberFormat("en-US",options).format(no)
// console.log(formatted);

// setInterval(()=>{
//   const now = new Date();
//   const hour = `${now.getHours()}`.padStart(2,0);
//   const minutes = `${now.getMinutes()}`.padStart(2,0);
//   const second = `${now.getSeconds()}`.padStart(2,0);
//   console.log(hour+":"+minutes+":"+second); 
// },1000)