// Game state
let deck = [];
let playerCards = [];
let dealerCards = [];
let splitCards = []; // Cards for the split hand
let playerScore = 0;
let dealerScore = 0;
let splitScore = 0; // Score for the split hand
let gameOver = false;
let playerWins = 0;
let playerLosses = 0;
let playerDraws = 0;
let playerBalance = 1000;
let currentBet = 0;
let currentSliderValue = 25; // Default slider value
let isSplit = false; // Flag to track if the hand is split
let activeHand = 'main'; // Track which hand is active (main or split)
let mainHandCompleted = false; // Flag to track if main hand is completed
let splitHandCompleted = false; // Flag to track if split hand is completed

// Hae username evästeestä tai kysy, jos ei löydy
let username = getCookie('username');
if (!username) {
    username = prompt("Anna käyttäjänimesi:") || "Tuntematon";
    setCookie('username', username, 365); // Tallentaa evästeen vuodeksi
}

// DOM elements
const dealerCardsEl = document.getElementById('dealer-cards');
const playerCardsEl = document.getElementById('player-cards');
const splitCardsEl = document.getElementById('split-cards');
const dealerScoreEl = document.getElementById('dealer-score');
const playerScoreEl = document.getElementById('player-score');
const splitScoreEl = document.getElementById('split-score');
const hitButton = document.getElementById('hit-button');
const standButton = document.getElementById('stand-button');
const doubleButton = document.getElementById('double-button');
const splitButton = document.getElementById('split-button');
const hitSplitButton = document.getElementById('hit-split-button');
const standSplitButton = document.getElementById('stand-split-button');
const doubleSplitButton = document.getElementById('double-split-button');
const betControls = document.getElementById('bet-controls');
const gameControlsMain = document.getElementById('game-controls-main');
const gameControlsSplit = document.getElementById('game-controls-split');
const balanceEl = document.getElementById('balance');
const currentBetEl = document.getElementById('current-bet');
const dealButton = document.getElementById('deal-button');
const placeBetButton = document.getElementById('place-bet');
const messageEl = document.getElementById('message');
const winsEl = document.getElementById('wins');
const lossesEl = document.getElementById('losses');
const drawsEl = document.getElementById('draws');
const betSlider = document.getElementById('bet-slider');
const sliderValue = document.getElementById('slider-value');
const playerHandSplitEl = document.getElementById('player-hand-split');

// Event listeners
betSlider.addEventListener('input', updateSliderValue);
placeBetButton.addEventListener('click', placeBet);
dealButton.addEventListener('click', startGame);
hitButton.addEventListener('click', hit);
standButton.addEventListener('click', stand);
doubleButton.addEventListener('click', doubleBet);
splitButton.addEventListener('click', splitHand);
hitSplitButton.addEventListener('click', hitSplit);
standSplitButton.addEventListener('click', standSplit);
doubleSplitButton.addEventListener('click', doubleBetSplit);

// Initialize the game
updateBalance();
updateSliderValue();

function updateSliderValue() {
  currentSliderValue = parseInt(betSlider.value);
  sliderValue.textContent = currentSliderValue;
  
  // Position the value label above the slider thumb
  const percent = (currentSliderValue - betSlider.min) / (betSlider.max - betSlider.min);
  sliderValue.style.left = `calc(${percent * 100}%)`;
  sliderValue.style.transform = `translateX(-50%)`;
}

// New function to update the slider max value based on player balance
function updateSliderMaxValue() {
  betSlider.max = playerBalance;
  
  // If current slider value is higher than max, adjust it
  if (currentSliderValue > playerBalance) {
    betSlider.value = playerBalance;
    updateSliderValue();
  }
}

function createDeck() {
  const suits = ['♥', '♦', '♠', '♣'];
  const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const deck = [];
  
  for (let suit of suits) {
    for (let value of values) {
      deck.push({ 
        suit, 
        value, 
        numericValue: getCardValue(value), 
        isRed: suit === '♥' || suit === '♦' 
      });
    }
  }
  
  return shuffleDeck(deck);
}

function shuffleDeck(deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function getCardValue(value) {
  if (value === 'A') return 11;
  if (['J', 'Q', 'K'].includes(value)) return 10;
  return parseInt(value);
}

function drawCard() {
  if (deck.length < 5) deck = createDeck();
  return deck.pop();
}

function calculateScore(cards) {
  let score = 0;
  let aces = 0;
  
  for (let card of cards) {
    score += card.numericValue;
    if (card.value === 'A') aces++;
  }
  
  // Adjust for aces if score is over 21
  while (score > 21 && aces > 0) {
    score -= 10; // Convert ace from 11 to 1
    aces--;
  }
  
  return score;
}

function createCardElement(card, hidden = false) {
  const cardEl = document.createElement('div');
  cardEl.className = `card ${hidden ? 'hidden' : ''}`;
  
  if (!hidden) {
    const topValue = document.createElement('div');
    topValue.className = `card-value ${card.isRed ? 'red' : 'black'}`;
    topValue.textContent = card.value;
    cardEl.appendChild(topValue);
    
    const suit = document.createElement('div');
    suit.className = `card-suit ${card.isRed ? 'red' : 'black'}`;
    suit.textContent = card.suit;
    cardEl.appendChild(suit);
    
    const bottomValue = document.createElement('div');
    bottomValue.className = `card-value ${card.isRed ? 'red' : 'black'}`;
    bottomValue.textContent = card.value;
    bottomValue.style.alignSelf = 'flex-end';
    cardEl.appendChild(bottomValue);
  }
  
  return cardEl;
}

function animateCardDeal(cardElement, delay) {
  cardElement.style.opacity = "0";
  setTimeout(() => cardElement.classList.add('dealt'), delay);
}

function placeBet() {
  const betAmount = currentSliderValue;
  
  if (playerBalance >= betAmount) {
    currentBet = betAmount;
    playerBalance -= betAmount;
    updateBalance();
    dealButton.disabled = false;
    placeBetButton.disabled = true;
    betSlider.disabled = true;
  } else {
    showMessage('Not enough balance!', 'lose');
  }
}

function updateBalance() {
  balanceEl.textContent = playerBalance;
  currentBetEl.textContent = currentBet;
  
  // Update the slider max value whenever balance changes
  updateSliderMaxValue();
}

function startGame() {
  if (currentBet === 0) {
    showMessage('Place a bet first!', 'lose');
    return;
  }
  
  // Reset game state
  deck = createDeck();
  playerCards = [];
  dealerCards = [];
  splitCards = [];
  playerScore = 0;
  dealerScore = 0;
  splitScore = 0;
  gameOver = false;
  isSplit = false;
  activeHand = 'main';
  mainHandCompleted = false;
  splitHandCompleted = false;
  
  // Clear UI
  dealerCardsEl.innerHTML = '';
  playerCardsEl.innerHTML = '';
  splitCardsEl.innerHTML = '';
  hideMessage();
  
  // Deal initial cards
  dealerCards.push(drawCard(), drawCard());
  playerCards.push(drawCard(), drawCard());
  
  // Update UI
  updatePlayerUI();
  updateDealerUI(true);
  betControls.style.display = 'none';
  gameControlsMain.style.display = 'flex';
  gameControlsSplit.style.display = 'none';
  playerHandSplitEl.style.display = 'none';
  
  // Check if the player can split (cards have the same numeric value)
  const canSplit = playerCards[0].numericValue === playerCards[1].numericValue;
  if (canSplit) {
    splitButton.style.display = 'flex';
    splitButton.disabled = playerBalance < currentBet;
  } else {
    splitButton.style.display = 'none';
  }
  
  // Check for natural blackjack
  if (playerScore === 21) {
    dealerScore = calculateScore(dealerCards);
    endGame(dealerScore === 21 ? 'push' : 'blackjack');
  }
  
  doubleButton.disabled = playerBalance < currentBet;
}

function updatePlayerUI() {
  playerCardsEl.innerHTML = '';
  playerScore = calculateScore(playerCards);
  
  playerCards.forEach((card, i) => {
    const cardEl = createCardElement(card);
    playerCardsEl.appendChild(cardEl);
    animateCardDeal(cardEl, i * 150);
  });
  
  playerScoreEl.textContent = playerScore;
}

function updateSplitUI() {
  splitCardsEl.innerHTML = '';
  splitScore = calculateScore(splitCards);
  
  splitCards.forEach((card, i) => {
    const cardEl = createCardElement(card);
    splitCardsEl.appendChild(cardEl);
    animateCardDeal(cardEl, i * 150);
  });
  
  splitScoreEl.textContent = splitScore;
}

function updateDealerUI(hideFirst = false) {
  dealerCardsEl.innerHTML = '';
  
  if (hideFirst) {
    const hiddenCardEl = createCardElement(dealerCards[0], true);
    dealerCardsEl.appendChild(hiddenCardEl);
    animateCardDeal(hiddenCardEl, 0);
    
    for (let i = 1; i < dealerCards.length; i++) {
      const cardEl = createCardElement(dealerCards[i]);
      dealerCardsEl.appendChild(cardEl);
      animateCardDeal(cardEl, i * 150);
    }
    
    const visibleScore = dealerCards.slice(1).reduce((sum, card) => sum + card.numericValue, 0);
    dealerScoreEl.textContent = visibleScore;
  } else {
    dealerScore = calculateScore(dealerCards);
    
    dealerCards.forEach((card, i) => {
      const cardEl = createCardElement(card);
      dealerCardsEl.appendChild(cardEl);
      animateCardDeal(cardEl, i * 150);
    });
    
    dealerScoreEl.textContent = dealerScore;
  }
}

function hit() {
  if (gameOver) return;
  
  playerCards.push(drawCard());
  updatePlayerUI();
  
  // Hide the split button after hitting
  splitButton.style.display = 'none';
  
  // Check if player busts
  if (playerScore > 21) {
    if (isSplit) {
      mainHandCompleted = true;
      switchToSplitHand();
    } else {
      endGame('bust');
    }
  }
}

function hitSplit() {
  if (gameOver) return;
  
  splitCards.push(drawCard());
  updateSplitUI();
  
  // Check if split hand busts
  if (splitScore > 21) {
    splitHandCompleted = true;
    standSplit();
  }
}

function stand() {
  if (gameOver) return;
  
  if (isSplit && !mainHandCompleted) {
    mainHandCompleted = true;
    switchToSplitHand();
  } else {
    updateDealerUI(false);
    setTimeout(dealerTurn, 500);
  }
}

function standSplit() {
  if (gameOver) return;
  
  splitHandCompleted = true;
  gameControlsSplit.style.display = 'none';
  updateDealerUI(false);
  setTimeout(dealerTurn, 500);
}

function switchToSplitHand() {
  gameControlsMain.style.display = 'none';
  gameControlsSplit.style.display = 'flex';
  activeHand = 'split';
  doubleSplitButton.disabled = splitCards.length > 1 || playerBalance < currentBet;
}

function dealerTurn() {
  if (dealerScore < 17) {
    dealerCards.push(drawCard());
    updateDealerUI(false);
    setTimeout(dealerTurn, 500);
  } else {
    determineWinner();
  }
}

function determineWinner() {
  if (!isSplit) {
    // Regular game without split
    if (dealerScore > 21) endGame('dealer-bust');
    else if (dealerScore > playerScore) endGame('dealer-win');
    else if (dealerScore < playerScore) endGame('player-win');
    else endGame('push');
  } else {
    // Game with split hands
    let mainResult = '', splitResult = '';
    
    // Main hand result
    if (playerScore > 21) {
      mainResult = 'bust';
    } else if (dealerScore > 21) {
      mainResult = 'dealer-bust';
    } else if (dealerScore > playerScore) {
      mainResult = 'dealer-win';
    } else if (dealerScore < playerScore) {
      mainResult = 'player-win';
    } else {
      mainResult = 'push';
    }
    
    // Split hand result
    if (splitScore > 21) {
      splitResult = 'bust';
    } else if (dealerScore > 21) {
      splitResult = 'dealer-bust';
    } else if (dealerScore > splitScore) {
      splitResult = 'dealer-win';
    } else if (dealerScore < splitScore) {
      splitResult = 'player-win';
    } else {
      splitResult = 'push';
    }
    
    endSplitGame(mainResult, splitResult);
  }
}

function doubleBet() {
  if (gameOver || playerCards.length > 2 || playerBalance < currentBet) {
    if (playerBalance < currentBet) showMessage('Not enough balance!', 'lose');
    return;
  }
  
  playerBalance -= currentBet;
  currentBet *= 2;
  updateBalance();
  
  playerCards.push(drawCard());
  updatePlayerUI();
  
  if (playerScore > 21) {
    if (isSplit) {
      mainHandCompleted = true;
      switchToSplitHand();
    } else {
      endGame('bust');
    }
  } else {
    stand();
  }
}

function doubleBetSplit() {
  if (gameOver || splitCards.length > 1 || playerBalance < currentBet) {
    if (playerBalance < currentBet) showMessage('Not enough balance!', 'lose');
    return;
  }
  
  playerBalance -= currentBet;
  currentBet *= 2; // Double the original bet for this split hand
  updateBalance();
  
  splitCards.push(drawCard());
  updateSplitUI();
  
  if (splitScore > 21) {
    splitHandCompleted = true;
    standSplit();
  } else {
    standSplit();
  }
}

function splitHand() {
  if (gameOver || playerCards.length !== 2 || playerBalance < currentBet) {
    if (playerBalance < currentBet) showMessage('Not enough balance!', 'lose');
    return;
  }
  
  // Deduct another bet for the split hand
  playerBalance -= currentBet;
  updateBalance();
  
  // Set split flag
  isSplit = true;
  
  // Show split hand container
  playerHandSplitEl.style.display = 'block';
  
  // Move second card to split hand
  splitCards.push(playerCards.pop());
  
  // Deal new cards to both hands
  playerCards.push(drawCard());
  splitCards.push(drawCard());
  
  // Update UI
  updatePlayerUI();
  updateSplitUI();
  
  // Hide split button
  splitButton.style.display = 'none';
  
  // Check for blackjacks
  if (playerScore === 21 && splitScore === 21) {
    mainHandCompleted = true;
    splitHandCompleted = true;
    updateDealerUI(false);
    setTimeout(dealerTurn, 500);
  } else if (playerScore === 21) {
    mainHandCompleted = true;
    switchToSplitHand();
  } else if (splitScore === 21) {
    splitHandCompleted = true;
  }
}
function saveBalanceToLeaderboard() {
  fetch('save_score.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `username=${encodeURIComponent(username)}&balance=${playerBalance}`
  })
  .then(response => response.text())
  .then(data => console.log(data))
  .catch(error => console.error('Virhe saldon tallennuksessa:', error));
}

function endGame(result) {
  gameOver = true;
  updateDealerUI(false);
  gameControlsMain.style.display = 'none';
  gameControlsSplit.style.display = 'none';
  betControls.style.display = 'flex';
  placeBetButton.disabled = false;
  betSlider.disabled = false;
  
  let message = '', messageClass = '';
  
  switch(result) {
      case 'blackjack':
          message = 'Blackjack! You win 3:2';
          messageClass = 'win';
          playerBalance += Math.floor(currentBet * 2.5);
          playerWins++;
          break;
      case 'player-win':
          message = 'You win!';
          messageClass = 'win';
          playerBalance += currentBet * 2;
          playerWins++;
          break;
      case 'dealer-win':
          message = 'Dealer wins.';
          messageClass = 'lose';
          playerLosses++;
          break;
      case 'bust':
          message = 'Bust! You lose.';
          messageClass = 'lose';
          playerLosses++;
          break;
      case 'dealer-bust':
          message = 'Dealer busts! You win!';
          messageClass = 'win';
          playerBalance += currentBet * 2;
          playerWins++;
          break;
      case 'push':
          message = 'Push! Bet returned.';
          messageClass = 'draw';
          playerBalance += currentBet;
          playerDraws++;
          break;
  }
  
  // Tallenna saldo leaderboardiin
  saveBalanceToLeaderboard();
  
  showMessage(message, messageClass);
  updateStats();
  currentBet = 0;
  updateBalance();
  dealButton.disabled = true;
  
  updateLeaderboardUI(); // Päivitä leaderboard heti
  checkGameContinuation();
}

function endSplitGame(mainResult, splitResult) {
  gameOver = true;
  updateDealerUI(false);
  gameControlsMain.style.display = 'none';
  gameControlsSplit.style.display = 'none';
  betControls.style.display = 'flex';
  placeBetButton.disabled = false;
  betSlider.disabled = false;
  
  const originalBet = isSplit ? currentBet / 2 : currentBet;
  let totalWinnings = 0;
  let message = 'Split hand results:\n';
  
  switch(mainResult) {
      case 'blackjack':
          message += 'Hand 1: Blackjack! ';
          totalWinnings += Math.floor(originalBet * 2.5);
          playerWins++;
          break;
      case 'player-win':
      case 'dealer-bust':
          message += 'Hand 1: Win! ';
          totalWinnings += originalBet * 2;
          playerWins++;
          break;
      case 'dealer-win':
      case 'bust':
          message += 'Hand 1: Loss. ';
          playerLosses++;
          break;
      case 'push':
          message += 'Hand 1: Push. ';
          totalWinnings += originalBet;
          playerDraws++;
          break;
  }
  
  switch(splitResult) {
      case 'blackjack':
          message += 'Hand 2: Blackjack!';
          totalWinnings += Math.floor(originalBet * 2.5);
          playerWins++;
          break;
      case 'player-win':
      case 'dealer-bust':
          message += 'Hand 2: Win!';
          totalWinnings += originalBet * 2;
          playerWins++;
          break;
      case 'dealer-win':
      case 'bust':
          message += 'Hand 2: Loss.';
          playerLosses++;
          break;
      case 'push':
          message += 'Hand 2: Push.';
          totalWinnings += originalBet;
          playerDraws++;
          break;
  }
  
  playerBalance += totalWinnings;
  
  // Tallenna saldo leaderboardiin
  saveBalanceToLeaderboard();
  
  let messageClass = 'draw';
  if (totalWinnings > originalBet * 2) {
      messageClass = 'win';
  } else if (totalWinnings < originalBet * 2) {
      messageClass = 'lose';
  }
  
  showMessage(message, messageClass);
  updateStats();
  currentBet = 0;
  updateBalance();
  dealButton.disabled = true;
  
  updateLeaderboardUI(); // Päivitä leaderboard heti
  checkGameContinuation();
}

function updateLeaderboardUI() {
  fetch('leaderboard.json')
      .then(response => {
          if (!response.ok) {
              throw new Error('Tiedostoa ei voitu hakea: ' + response.status);
          }
          return response.text();
      })
      .then(text => {
          let data = [];
          if (text) {
              try {
                  data = JSON.parse(text); // Yritä jäsentää JSON
              } catch (e) {
                  console.error('Virhe JSON-jäsennyksessä:', e);
                  throw new Error('Virheellinen JSON-t~tiedosto');
              }
          }
          const leaderboardEl = document.getElementById('leaderboard');
          leaderboardEl.innerHTML = '';
          if (Array.isArray(data) && data.length > 0) {
              data.slice(0, 10).forEach(entry => {
                  const li = document.createElement('li');
                  li.textContent = `${entry.username}: ${entry.balance}`;
                  leaderboardEl.appendChild(li);
              });
          } else {
              const li = document.createElement('li');
              li.textContent = 'Ei vielä tuloksia.';
              leaderboardEl.appendChild(li);
          }
      })
      .catch(error => {
          console.error('Virhe leaderboardin latauksessa:', error);
          const leaderboardEl = document.getElementById('leaderboard');
          leaderboardEl.innerHTML = '<li>Virhe ladattaessa leaderboardia.</li>';
      });
}

function showMessage(text, cls) {
  messageEl.textContent = text;
  messageEl.className = `message show ${cls || ''}`;
}

function hideMessage() {
  messageEl.className = 'message';
}

function updateStats() {
  winsEl.textContent = playerWins;
  lossesEl.textContent = playerLosses;
  drawsEl.textContent = playerDraws;
}

function checkGameContinuation() {
  if (playerBalance === 0) {
    setTimeout(() => showMessage('Kuoppasit just vittu kaiken! Refresh to try again.', 'lose'), 1000);
  } else if (playerBalance < 10) {
    setTimeout(() => {
      playerBalance += 100;
      updateBalance();
      showMessage('Low balance! +100 chips.', 'win');
    }, 1000);
  }
}

// Initialize deck
deck = createDeck();

// Initialize with max value set to player balance
updateSliderMaxValue();

// Funktio evästeen hakemiseen
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

// Funktio evästeen asettamiseen
function setCookie(name, value, days) {
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/`;
}