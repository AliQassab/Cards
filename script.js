// Global variables
let cards = [];
let currentAlgorithm = null;
let isRunning = false;
let currentStep = 0;
let stats = {
  bubble: { comparisons: 0, swaps: 0, steps: 0 },
  insertion: { comparisons: 0, swaps: 0, steps: 0 },
  merge: { comparisons: 0, swaps: 0, steps: 0 },
  counting: { operations: 0, steps: 0 },
};

// Card values for different scenarios
const cardValues = {
  suit: ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"],
  numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
  colors: [
    "red",
    "red",
    "red",
    "red",
    "red",
    "black",
    "black",
    "black",
    "black",
    "black",
    "black",
    "black",
    "black",
  ],
};

// Initialize the application
document.addEventListener("DOMContentLoaded", function () {
  initializeCards();
  setupEventListeners();
  updateDisplay();
});

function initializeCards() {
  const cardCount = parseInt(document.getElementById("cardCount").value);
  const initialOrder = document.getElementById("initialOrder").value;

  cards = [];

  if (cardCount === 13) {
    // Use full suit
    for (let i = 0; i < 13; i++) {
      cards.push({
        value: cardValues.suit[i],
        numericValue: cardValues.numbers[i],
        color: cardValues.colors[i],
        element: null,
        sorted: false,
      });
    }
  } else {
    // Use random numbers
    const values = Array.from({ length: cardCount }, (_, i) => i + 1);
    for (let i = 0; i < cardCount; i++) {
      cards.push({
        value: values[i].toString(),
        numericValue: values[i],
        color: "black",
        element: null,
        sorted: false,
      });
    }
  }

  // Apply initial ordering
  if (initialOrder === "reverse") {
    cards.reverse();
  } else if (initialOrder === "random") {
    shuffleCards();
  }

  renderCards();
}

function shuffleCards() {
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  resetAllStats();
}

function renderCards() {
  const container = document.getElementById("cardsContainer");
  container.innerHTML = "";

  cards.forEach((card, index) => {
    const cardElement = document.createElement("div");
    cardElement.className = `card ${card.color}`;
    cardElement.textContent = card.value;
    cardElement.dataset.index = index;

    card.element = cardElement;
    container.appendChild(cardElement);
  });
}

function setupEventListeners() {
  // Card setup controls
  document.getElementById("shuffleBtn").addEventListener("click", function () {
    shuffleCards();
    renderCards();
    resetAllStats();
    resetAllAlgorithms();
  });

  document.getElementById("resetBtn").addEventListener("click", function () {
    initializeCards();
    resetAllStats();
    resetAllAlgorithms();
  });

  document.getElementById("cardCount").addEventListener("change", function () {
    initializeCards();
    resetAllStats();
    resetAllAlgorithms();
  });

  document
    .getElementById("initialOrder")
    .addEventListener("change", function () {
      initializeCards();
      resetAllStats();
      resetAllAlgorithms();
    });

  // Algorithm tabs
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const algorithm = this.dataset.algorithm;
      switchAlgorithm(algorithm);
    });
  });

  // Algorithm buttons
  document
    .getElementById("bubbleSortBtn")
    .addEventListener("click", () => startAlgorithm("bubble"));
  document
    .getElementById("bubbleStepBtn")
    .addEventListener("click", () => stepAlgorithm("bubble"));
  document
    .getElementById("bubbleResetBtn")
    .addEventListener("click", () => resetAlgorithm("bubble"));

  document
    .getElementById("insertionSortBtn")
    .addEventListener("click", () => startAlgorithm("insertion"));
  document
    .getElementById("insertionStepBtn")
    .addEventListener("click", () => stepAlgorithm("insertion"));
  document
    .getElementById("insertionResetBtn")
    .addEventListener("click", () => resetAlgorithm("insertion"));

  document
    .getElementById("mergeSortBtn")
    .addEventListener("click", () => startAlgorithm("merge"));
  document
    .getElementById("mergeStepBtn")
    .addEventListener("click", () => stepAlgorithm("merge"));
  document
    .getElementById("mergeResetBtn")
    .addEventListener("click", () => resetAlgorithm("merge"));

  document
    .getElementById("countingSortBtn")
    .addEventListener("click", () => startAlgorithm("counting"));
  document
    .getElementById("countingStepBtn")
    .addEventListener("click", () => stepAlgorithm("counting"));
  document
    .getElementById("countingResetBtn")
    .addEventListener("click", () => resetAlgorithm("counting"));
}

function switchAlgorithm(algorithm) {
  // Update tabs
  document
    .querySelectorAll(".tab-btn")
    .forEach((btn) => btn.classList.remove("active"));
  document
    .querySelector(`[data-algorithm="${algorithm}"]`)
    .classList.add("active");

  // Update panels
  document
    .querySelectorAll(".algorithm-panel")
    .forEach((panel) => panel.classList.remove("active"));
  document.getElementById(`${algorithm}-content`).classList.add("active");

  currentAlgorithm = algorithm;
}

function startAlgorithm(algorithm) {
  if (isRunning) return;

  currentAlgorithm = algorithm;
  isRunning = true;
  currentStep = 0;

  // Reset stats
  resetStats(algorithm);

  // Disable start button, enable step button
  document.getElementById(`${algorithm}SortBtn`).disabled = true;
  document.getElementById(`${algorithm}StepBtn`).disabled = false;

  // Reset card states
  cards.forEach((card) => {
    card.sorted = false;
    if (card.element) {
      card.element.classList.remove(
        "comparing",
        "swapping",
        "sorted",
        "current"
      );
    }
  });

  updateDisplay();
}

function stepAlgorithm(algorithm) {
  if (!isRunning) return;

  let completed = false;

  switch (algorithm) {
    case "bubble":
      completed = bubbleSortStep();
      break;
    case "insertion":
      completed = insertionSortStep();
      break;
    case "merge":
      completed = mergeSortStep();
      break;
    case "counting":
      completed = countingSortStep();
      break;
  }

  stats[algorithm].steps++;
  updateDisplay();

  if (completed) {
    finishAlgorithm(algorithm);
  }
}

function finishAlgorithm(algorithm) {
  isRunning = false;
  currentStep = 0;

  // Mark all cards as sorted
  cards.forEach((card) => {
    card.sorted = true;
    if (card.element) {
      card.element.classList.add("sorted");
      card.element.classList.remove("comparing", "swapping", "current");
    }
  });

  // Update buttons
  document.getElementById(`${algorithm}SortBtn`).disabled = false;
  document.getElementById(`${algorithm}StepBtn`).disabled = true;

  updateDisplay();
}

function resetAlgorithm(algorithm) {
  // Stop any running algorithm
  isRunning = false;
  currentStep = 0;

  // Reset algorithm-specific variables
  if (algorithm === "insertion") {
    insertionIndex = 0;
    insertionJ = 0;
  }

  // Reset stats for this algorithm
  resetStats(algorithm);

  // Reset card states
  cards.forEach((card) => {
    card.sorted = false;
    if (card.element) {
      card.element.classList.remove(
        "comparing",
        "swapping",
        "sorted",
        "current"
      );
    }
  });

  // Update buttons for this algorithm
  document.getElementById(`${algorithm}SortBtn`).disabled = false;
  document.getElementById(`${algorithm}StepBtn`).disabled = true;

  updateDisplay();
}

function resetStats(algorithm) {
  if (algorithm === "counting") {
    stats[algorithm].operations = 0;
    stats[algorithm].steps = 0;
  } else {
    stats[algorithm].comparisons = 0;
    stats[algorithm].swaps = 0;
    stats[algorithm].steps = 0;
  }
}

function resetAllStats() {
  Object.keys(stats).forEach((algorithm) => {
    resetStats(algorithm);
  });
}

function resetAllAlgorithms() {
  Object.keys(stats).forEach((algorithm) => {
    resetAlgorithm(algorithm);
  });
}

// Bubble Sort Implementation
function bubbleSortStep() {
  const n = cards.length;
  let swapped = false;
  let completed = false;

  // Find the current position in the algorithm
  let i = Math.floor(currentStep / n);
  let j = currentStep % n;

  if (i >= n - 1) {
    completed = true;
    return completed;
  }

  if (j >= n - 1 - i) {
    // End of current pass, move to next pass
    currentStep = (i + 1) * n;
    return false;
  }

  // Clear previous highlights
  cards.forEach((card) => {
    if (card.element) {
      card.element.classList.remove("comparing");
    }
  });

  // Highlight current comparison
  if (cards[j].element) {
    cards[j].element.classList.add("comparing");
  }
  if (cards[j + 1].element) {
    cards[j + 1].element.classList.add("comparing");
  }

  stats.bubble.comparisons++;

  // Compare and swap if needed
  if (cards[j].numericValue > cards[j + 1].numericValue) {
    // Perform swap
    [cards[j], cards[j + 1]] = [cards[j + 1], cards[j]];

    // Update visual positions by re-rendering all cards
    const container = document.getElementById("cardsContainer");
    container.innerHTML = "";
    cards.forEach((card) => {
      container.appendChild(card.element);
    });

    // Highlight swap
    if (cards[j].element) cards[j].element.classList.add("swapping");
    if (cards[j + 1].element) cards[j + 1].element.classList.add("swapping");

    setTimeout(() => {
      if (cards[j].element) cards[j].element.classList.remove("swapping");
      if (cards[j + 1].element)
        cards[j + 1].element.classList.remove("swapping");
    }, 500);

    stats.bubble.swaps++;
    swapped = true;
  }

  currentStep++;
  return false;
}

// Insertion Sort Implementation
let insertionIndex = 0; // Track which element we're inserting
let insertionJ = 0; // Track position in insertion process

function insertionSortStep() {
  const n = cards.length;
  let completed = false;

  // Check if we've processed all elements
  if (insertionIndex >= n) {
    completed = true;
    return completed;
  }

  // Clear previous highlights
  cards.forEach((card) => {
    if (card.element) {
      card.element.classList.remove("comparing", "current", "sorted");
    }
  });

  // Mark all elements before insertionIndex as sorted
  for (let i = 0; i < insertionIndex; i++) {
    if (cards[i].element) {
      cards[i].element.classList.add("sorted");
    }
  }

  // Highlight current element being inserted
  if (cards[insertionIndex].element) {
    cards[insertionIndex].element.classList.add("current");
  }

  if (insertionIndex === 0) {
    // First element is already "sorted"
    insertionIndex++;
    return false;
  }

  // If we're starting insertion for this element, initialize j
  if (insertionJ === 0) {
    insertionJ = insertionIndex;
  }

  // Check if we need to swap with the element to the left
  if (
    insertionJ > 0 &&
    cards[insertionJ - 1].numericValue > cards[insertionJ].numericValue
  ) {
    // Highlight the comparison
    if (cards[insertionJ - 1].element) {
      cards[insertionJ - 1].element.classList.add("comparing");
    }

    stats.insertion.comparisons++;

    // Perform the swap
    [cards[insertionJ - 1], cards[insertionJ]] = [
      cards[insertionJ],
      cards[insertionJ - 1],
    ];

    // Update visual positions by re-rendering all cards
    const container = document.getElementById("cardsContainer");
    container.innerHTML = "";
    cards.forEach((card) => {
      container.appendChild(card.element);
    });

    stats.insertion.swaps++;
    insertionJ--;

    // Continue with the same element
    return false;
  } else {
    // No swap needed, element is in correct position
    if (insertionJ > 0) {
      stats.insertion.comparisons++;
    }
    insertionIndex++;
    insertionJ = 0; // Reset for next element
    return false;
  }
}

// Merge Sort Implementation (simplified)

function mergeSortStep() {
  // Simple bubble sort implementation for merge sort tab
  const n = cards.length;

  if (currentStep >= n * (n - 1)) {
    return true; // Completed
  }

  // Clear previous highlights
  cards.forEach((card) => {
    if (card.element) {
      card.element.classList.remove("comparing", "current", "sorted");
    }
  });

  // Simple bubble sort logic
  let i = Math.floor(currentStep / n);
  let j = currentStep % n;

  if (i >= n - 1) {
    return true;
  }

  if (j >= n - 1 - i) {
    currentStep = (i + 1) * n;
    return false;
  }

  // Highlight current comparison
  if (cards[j].element) {
    cards[j].element.classList.add("comparing");
  }
  if (cards[j + 1].element) {
    cards[j + 1].element.classList.add("comparing");
  }

  stats.merge.comparisons++;

  // Compare and swap if needed
  if (cards[j].numericValue > cards[j + 1].numericValue) {
    [cards[j], cards[j + 1]] = [cards[j + 1], cards[j]];

    // Update visual positions
    const container = document.getElementById("cardsContainer");
    container.innerHTML = "";
    cards.forEach((card) => {
      container.appendChild(card.element);
    });

    stats.merge.swaps++;
  }

  currentStep++;
  return false;
}

// Counting Sort Implementation (O(n) for cards)
function countingSortStep() {
  const n = cards.length;
  let completed = false;

  if (currentStep >= n) {
    completed = true;
    return completed;
  }

  // Clear previous highlights
  cards.forEach((card) => {
    if (card.element) {
      card.element.classList.remove("current");
    }
  });

  // Highlight current card
  if (cards[currentStep].element) {
    cards[currentStep].element.classList.add("current");
  }

  // Find correct position for current card
  const correctPosition = cards[currentStep].numericValue - 1;

  if (currentStep !== correctPosition) {
    // Move card to correct position
    const tempCard = cards.splice(currentStep, 1)[0];
    cards.splice(correctPosition, 0, tempCard);

    // Update visual positions
    const container = document.getElementById("cardsContainer");
    container.innerHTML = "";
    cards.forEach((card) => {
      container.appendChild(card.element);
    });
  }

  stats.counting.operations++;
  currentStep++;
  return false;
}

function updateDisplay() {
  // Update stats displays
  document.getElementById("bubbleComparisons").textContent =
    stats.bubble.comparisons;
  document.getElementById("bubbleSwaps").textContent = stats.bubble.swaps;
  document.getElementById("bubbleSteps").textContent = stats.bubble.steps;

  document.getElementById("insertionComparisons").textContent =
    stats.insertion.comparisons;
  document.getElementById("insertionSwaps").textContent = stats.insertion.swaps;
  document.getElementById("insertionSteps").textContent = stats.insertion.steps;

  document.getElementById("mergeComparisons").textContent =
    stats.merge.comparisons;
  document.getElementById("mergeSwaps").textContent = stats.merge.swaps;
  document.getElementById("mergeSteps").textContent = stats.merge.steps;

  document.getElementById("countingOperations").textContent =
    stats.counting.operations;
  document.getElementById("countingSteps").textContent = stats.counting.steps;

  // Debug: Log current card order for insertion sort
  if (currentAlgorithm === "insertion" && isRunning) {
    console.log(
      "Insertion Sort Debug - insertionIndex:",
      insertionIndex,
      "insertionJ:",
      insertionJ
    );
    console.log("Current order:", cards.map((c) => c.value).join(", "));
  }
}

// Utility functions
function swapCards(i, j) {
  [cards[i], cards[j]] = [cards[j], cards[i]];
}

function isSorted() {
  for (let i = 1; i < cards.length; i++) {
    if (cards[i - 1].numericValue > cards[i].numericValue) {
      return false;
    }
  }
  return true;
}

// Auto-play functionality (optional)
function autoPlay(algorithm, speed = 1000) {
  if (isRunning) return;

  startAlgorithm(algorithm);

  const interval = setInterval(() => {
    if (!isRunning) {
      clearInterval(interval);
      return;
    }

    stepAlgorithm(algorithm);

    if (!isRunning) {
      clearInterval(interval);
    }
  }, speed);
}
