import { Toggle } from './toggle.js';

const overlay = document.getElementById('overlay');
// settings and how to play Content elements
const howToPlayContent = document.getElementById('how-to-play');
const settingsContent = document.getElementById('setting');
const exitGameContent = document.getElementById('exit');
const toggleMusicEl = document.getElementById('toggle-music');
const toggleSoundEl = document.getElementById('toggle-sound');
const onMusic = document.getElementById('on-music');
const offMusic = document.getElementById('off-music');
const onSound = document.getElementById('on-sound');
const offSound = document.getElementById('off-sound');

// Get the game board element
const gameBoard = document.getElementById('game-board');
const emojis = ['🎄', '🎁', '🎅', '☃️']; // Your set of emojis (excluding Flip-O)

// Game variables
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let unmatchedCards = []; // To store unmatched cards
let timer; // To track the countdown timer
let timeLeft = 9; // Countdown duration in seconds

// Initialize toggles
const musicToggle = new Toggle(toggleMusicEl, onMusic, offMusic);
const soundToggle = new Toggle(toggleSoundEl, onSound, offSound);

// Hide all content and overlay initially
overlay.classList.remove('visible'); // Ensure overlay is hidden initially

// Function to show specific content
const showContent = (contentToShow) => {
    // Hide all sections
    howToPlayContent.style.display = 'none';
    settingsContent.style.display = 'none';
    exitGameContent.style.display = 'none';

    // Show the selected section
    contentToShow.style.display = 'block';
    overlay.classList.add('visible'); // Ensure overlay is visible
};

// Handle button clicks
document.addEventListener('click', (e) => {
    const target = e.target.closest('button'); // Ensure the click is on a button

    if (!target) {
        return; // Exit early if no button is clicked
    }

    if (target.id === "how-to-play-btn") {
        showContent(howToPlayContent);
    } else if (target.id === "setting-btn") {
        showContent(settingsContent);
    } else if (target.id === "exits-btn") {
        showContent(exitGameContent);
    } else if (target.id === "close-btn") {
        overlay.classList.remove('visible');
    }
});

// Duplicate emojis to create pairs and shuffle the deck
const shuffleDeck = () => {
    const deck = [...emojis, ...emojis]; // Duplicate emojis for pairs
    const shuffledDeck = deck.sort(() => 0.5 - Math.random()); // Randomize order

    // Insert 'Flip-O' in the middle of the deck
    const middleIndex = Math.floor(shuffledDeck.length / 2);
    shuffledDeck.splice(middleIndex, 0, 'Flip-O');

    return shuffledDeck;
};

// Create the cards and add them to the game board
const initializeGame = () => {
    gameBoard.innerHTML = '';
    unmatchedCards = []; // Clear unmatched cards
    const shuffledDeck = shuffleDeck();

    shuffledDeck.forEach((emoji, index) => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.setAttribute('data-emoji', emoji);
        card.setAttribute('data-index', index);

        if (emoji === 'Flip-O') {
            card.innerHTML = `
                <div class="card-inner flip-o">
                    <div class="card-back">${emoji}</div>
                </div>
            `;
            card.classList.add('flip-o'); // Add unique class for Flip-O
        } else {
            card.innerHTML = `
                <div class="card-inner">
                    <div class="card-front">
                        <img src="./img/question-mark.png" class="card-front" />
                    </div>
                    <div class="card-back hidden">${emoji}</div>
                </div>
            `;
        }

        card.addEventListener('click', handleCardClick);
        gameBoard.appendChild(card);
    });

    resetTimer();
};



const startTimer = () => {
    const flipOCard = document.querySelector('.flip-o .card-back');
    timeLeft = 9;

    if (timer) clearInterval(timer); // Clear any existing timer

    timer = setInterval(() => {
        if (flipOCard) {
            flipOCard.textContent = `${timeLeft}`; // Update Flip-O card with the timer
            flipOCard.classList.add('animated');
        }

        if (timeLeft <= 0) {
            clearInterval(timer); // Stop the timer when it reaches 0

            // Close the single unmatched card if void and void pair are active
            if (firstCard && !secondCard && isVoidPairActive()) {
                hideCards(firstCard, firstCard); // Close the single unmatched card
                resetTurn(); // Reset the turn
            }

            setTimeout(() => {
                if (flipOCard) {
                    closeFirstCardIfTimeout(); // Handle timeout
                    flipOCard.textContent = 'Flip-O';
                    flipOCard.classList.remove('animated'); // Revert to Flip-O
                }
            }, 300); // Short delay before reverting to Flip-O
        }

        timeLeft--;
    }, 1000);
};

// Function to check if "void" and "void pair" are active
const isVoidPairActive = () => {
    return unmatchedCards.some(card => 
        card.querySelector('.void-sign') || card.querySelector('.void-pair-sign')
    );
};


// Close the first card if the timer runs out
const closeFirstCardIfTimeout = () => {
    if (firstCard && !secondCard) {
        hideCards(firstCard, firstCard); // Close the first card
        resetTurn(); // Reset the turn
        resetTimer(); // Reset the timer display
    }
};

const resetTimer = () => {
    const flipOCard = document.querySelector('.flip-o .card-back');
    if (timer) clearInterval(timer);
    if (flipOCard) {
        flipOCard.textContent = 'Flip-O';
        flipOCard.classList.remove('animated');
    }
};

const handleUnmatchedCards = (card1, card2) => {
    const back1 = card1.querySelector('.card-back');
    const back2 = card2.querySelector('.card-back');

    if (back1 && back2) {
        const unmatchedSign1 = document.createElement('span');
        unmatchedSign1.classList.add('status-sign', 'unmatched-sign');
        unmatchedSign1.textContent = 'X'; // Add X mark
        back1.appendChild(unmatchedSign1);

        const unmatchedSign2 = document.createElement('span');
        unmatchedSign2.classList.add('status-sign', 'unmatched-sign');
        unmatchedSign2.textContent = 'X'; // Add X mark
        back2.appendChild(unmatchedSign2);

        // Apply unmatched styling
        card1.style.backgroundColor = '#a52a2a15'; // Red background
        card2.style.backgroundColor = '#a52a2a15'; // Red background
    }

    // Add to unmatched cards list
    unmatchedCards.push(card1, card2);

    resetTurn(); // Reset turn variables
};


const handleMatchedCards = (card1, card2) => {
    const back1 = card1.querySelector('.card-back');
    const back2 = card2.querySelector('.card-back');

    if (back1 && back2) {
        const matchedSign1 = document.createElement('span');
        matchedSign1.classList.add('status-sign', 'matched-sign');
        matchedSign1.textContent = '✅'; // Add checkmark
        back1.appendChild(matchedSign1);

        const matchedSign2 = document.createElement('span');
        matchedSign2.classList.add('status-sign', 'matched-sign');
        matchedSign2.textContent = '✅'; // Add checkmark
        back2.appendChild(matchedSign2);
    }

    // Remove cards from unmatchedCards if they exist
    unmatchedCards = unmatchedCards.filter(
        card => card !== card1 && card !== card2
    );

    card1.removeEventListener('click', handleCardClick);
    card2.removeEventListener('click', handleCardClick);
    card1.style.backgroundColor = 'rgba(0, 255, 106, 0.12)'; // green background with opacity
    card2.style.backgroundColor = 'rgba(0, 255, 106, 0.12)'; // green background with opacity

    resetTurn();
};


const handleCardClick = (event) => {
    if (lockBoard) return; // Prevent clicking when processing
    const card = event.currentTarget;

    if (card.classList.contains('revealed')) return; // Prevent clicking an already revealed card

    if (card === firstCard) return; // Prevent clicking the same card twice

    revealCard(card);

    // Check if the clicked card matches any card in the unmatchedCards list
    const matchWithUnmatched = unmatchedCards.find(
        unmatchedCard => unmatchedCard.getAttribute('data-emoji') === card.getAttribute('data-emoji')
    );

    if (matchWithUnmatched) {
        handleVoidMatch(card, matchWithUnmatched); // Handle as a void match
        return;
    }

    if (!firstCard) {
        firstCard = card;
        startTimer(); // Start the timer on the first card
        return;
    }

    secondCard = card;
    clearInterval(timer); // Stop the timer if the second card is clicked
    resetTimer(); // Reset the Flip-O card display
    checkForMatch();
};



const handleVoidMatch = (voidCard, unmatchedCard) => {
    // Mark the newly clicked card as "void"
    const backVoid = voidCard.querySelector('.card-back');
    if (backVoid) {
        const voidSign = document.createElement('span');
        voidSign.classList.add('status-sign', 'void-sign');
        voidSign.textContent = 'Void';
        backVoid.appendChild(voidSign);
    }

    // Add "Void Pair" to the second card in the void pair
    const backUnmatched = unmatchedCard.querySelector('.card-back');
    if (backUnmatched) {
        const unmatchedSign = document.createElement('span');
        unmatchedSign.classList.add('status-sign', 'void-pair-sign');
        unmatchedSign.textContent = 'Void Pair'; // Replace X with "Void Pair"
        backUnmatched.appendChild(unmatchedSign);
    }

    // Change the background color of both cards to indicate a void pair
    voidCard.style.backgroundColor = 'rgba(16, 77, 76, 0.17)'; // Light red for void
    unmatchedCard.style.backgroundColor = 'rgba(16, 77, 76, 0.17)'; // Same for its pair

    // Keep both cards revealed and remove the previously unmatched card from unmatchedCards
    voidCard.classList.add('revealed');
    unmatchedCard.classList.add('revealed');
    unmatchedCards = unmatchedCards.filter(card => card !== unmatchedCard);

    clearInterval(timer); // Stop the timer if the second card is clicked
    resetTimer(); // Reset the Flip-O card display
};


// Check if two cards match
const checkForMatch = () => {
    const isMatch = firstCard.getAttribute('data-emoji') === secondCard.getAttribute('data-emoji');

    if (isMatch) {
        handleMatchedCards(firstCard, secondCard);
    } else {
        handleUnmatchedCards(firstCard, secondCard);
    }

    // Check for game over condition
    checkGameOver();
};

// Check if there are remaining possible matches
const checkGameOver = () => {
    const allCards = Array.from(gameBoard.querySelectorAll('.card'));
    const unrevealedCards = allCards.filter(
        card => !card.classList.contains('revealed') && card.getAttribute('data-emoji') !== 'Flip-O'
    );

    const unmatchedEmojis = unrevealedCards.map(card => card.getAttribute('data-emoji'));
    const uniqueEmojis = [...new Set(unmatchedEmojis)];

    // Check if there are any possible pairs left
    const hasPossiblePairs = uniqueEmojis.some(emoji => unmatchedEmojis.filter(e => e === emoji).length > 1);

    if (!hasPossiblePairs) {
        // Reveal all remaining unrevealed cards briefly
        unrevealedCards.forEach(card => {
            revealCard(card);
            card.style.backgroundColor = 'rgba(255, 140, 0, 0.15)';
        });

        setTimeout(() => {
            console.log("Game Over! Reshuffling the cards...");
            initializeGame(); // Reshuffle and reset the game
        }, 1000); // Show cards for 2 seconds before reshuffling
    }
};


// Reveal a card
const revealCard = (card) => {
    const front = card.querySelector('.card-front');
    const back = card.querySelector('.card-back');
    front.classList.add('hidden');
    back.classList.remove('hidden');
    card.classList.add('revealed'); // Add the revealed class to the card
};


// Hide cards (remove revealed class)
const hideCards = (card1, card2) => {
    setTimeout(() => {
        const front1 = card1.querySelector('.card-front');
        const back1 = card1.querySelector('.card-back');
        const front2 = card2.querySelector('.card-front');
        const back2 = card2.querySelector('.card-back');

        if (front1 && back1) {
            front1.classList.remove('hidden');
            back1.classList.add('hidden');
        }

        if (front2 && back2) {
            front2.classList.remove('hidden');
            back2.classList.add('hidden');
        }

        card1.classList.remove('revealed'); // Remove the revealed class
        card2.classList.remove('revealed'); // Remove the revealed class

        resetTurn();
    }, 1000);
};


// Reset turn variables
const resetTurn = () => {
    [firstCard, secondCard] = [null, null];
    lockBoard = false;
};

// Add restart game button functionality
const addRestartButton = () => {
    const restartButton = document.getElementById('restart-button');
    restartButton.addEventListener('click', initializeGame);
};

// Initialize everything
addRestartButton();
initializeGame();
