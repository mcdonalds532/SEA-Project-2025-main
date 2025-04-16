let bigCats = []; // Store big cat data in array.
let compareFlag = false; // Global flag to track if comparison feature is being used.
let selectedCards = []; // Array stores the indices of the cards selected.

// Essentially updates the cards to be displayed.
function showCards()
{
  const cardContainer = document.getElementById("card-container");
  cardContainer.innerHTML = "";
  const templateCard = document.querySelector(".card");

  for(let i = 0; i < bigCats.length; i++)
  {
    const nextCard = templateCard.cloneNode(true);
    editCardContent(nextCard, bigCats[i]);
    nextCard.addEventListener("click", () =>
    {
      if(compareFlag)
          selectCardEventHandler(nextCard, i);
    });
    cardContainer.appendChild(nextCard);
  }
}

// Function receives catData, representing the a cat object.
function editCardContent(card, catData)
{ 
  const cardHeader = card.querySelector("h2");
  card.style.display = "block";

  // Set the conservation status; to be used later in a function.
  card.dataset.conservationStatus = catData.conservationStatus;

  // Set the image (stored locally).
  const cardImage = card.querySelector("img");
  cardImage.src = "images/" + catData.name.toLowerCase().trim() + ".jpg";

  // Need to clean this up.
  card.querySelector(".regions").textContent = catData.regions.join(", ");
  card.querySelector(".lifespan").textContent = catData.lifespan.join("-");
  card.querySelector(".speed").textContent = catData.speed.join("-");
  card.querySelector(".length").textContent = catData.length.join("-");
  card.querySelector(".mass").textContent = catData.mass.join("-");
  card.querySelector(".biteForce").textContent = catData.biteForce;

  // Set display format depending on the compare flag.
  if(!compareFlag)
  {
    cardHeader.innerHTML = `<span class="catName">${catData.name}</span> <span class="scientificName">${catData.scientificName}</span>`;
  }
  else
  {
    // Need three more table rows for comparison view.
    cardHeader.innerHTML = `<span class="catName">${catData.name}</span>`;
    const table = card.querySelector(".bigCatInfo");

    const scientificNameRow = document.createElement("tr");
    const genusRow = document.createElement("tr");
    const conservationStatusRow = document.createElement("tr");

    scientificNameRow.innerHTML = `<td>Scientific Name</td><td>${catData.scientificName}</td>`;
    genusRow.innerHTML = `<td>Genus</td><td>${catData.genus}</td>`;
    conservationStatusRow.innerHTML = `<td>Conservation Status</td><td>${catData.conservationStatus}</td>`;

    table.appendChild(scientificNameRow);
    table.appendChild(genusRow);
    table.appendChild(conservationStatusRow);
  }
}

document.addEventListener("DOMContentLoaded", () => 
{
    initialize();
    const category = document.getElementById("category");
    const asc = document.getElementById("asc");
    const desc = document.getElementById("desc");
    category.addEventListener("change", sortBigCats);
    asc.addEventListener("change", sortBigCats);
    desc.addEventListener("change", sortBigCats);
});

// Sorts bigCats[] depending on the category and method selected by user.
function sortBigCats()
{
  // Reset the information/output panel to empty.
  const infoPanel = document.getElementById("infoPanel").innerHTML = "";

  // Retrieve highlighted category. If none selected, default value is "".
  const category = document.getElementById("category").value;
  if(!category)
  {
    showCards();
    return;
  }
  // Array.isArray() handles the case where there is only one numerical value.
  bigCats.sort((a, b) =>
  {
    if(document.getElementById("asc").checked)
    {
      if(Array.isArray(a[category]))
        return a[category][1] - b[category][1];
      return a[category] - b[category];
    }
    if(Array.isArray(a[category]))
      return b[category][0] - a[category][0];
    return b[category] - a[category];
  });
  showCards();
}

// Retrieves the data of the cats from .json file.
function initialize()
{
  fetch('bigcats.json')
  .then(res => res.json())
  .then(data =>
  {
    bigCats = data;
    showCards();
  })
}

function showConservationStatus()
{
  // Set the infoPanel text.
  const infoPanel = document.getElementById("infoPanel");
  infoPanel.innerHTML = "<h3>Legend: </h3>";

  // Preset colors for each conservation status.
  const statusColors =
  {
    "Endangered": "red",
    "Vulnerable": "yellow",
    "Near Threatened": "cyan",
    "Least Concern": "green"
  };

  // Change the color of the border for each.
  const deck = document.querySelectorAll(".card");
  deck.forEach((card) =>
  {
    const color = statusColors[card.dataset.conservationStatus];
    card.style.borderColor = color;
  });

  // For each color, create a circle and text, representing a legend item to be appended to the infoPanel.
  for(const status in statusColors)
  {
    const legendItem = document.createElement("div");
    legendItem.classList.add("legendItem"); // We want to style these too.

    const colorCircle = document.createElement("div");
    colorCircle.classList.add("legendColorCircle");
    colorCircle.style.backgroundColor = statusColors[status];

    const statusText = document.createElement("span");
    statusText.textContent = status;

    legendItem.appendChild(colorCircle);
    legendItem.appendChild(statusText);

    infoPanel.appendChild(legendItem);
  }
}

function compareCats()
{
  resetCardBorders();
  const infoPanel = document.getElementById("infoPanel");
  infoPanel.innerHTML = "<h3>Select 2 cats to compare!</h3>";
  compareFlag = true;
}

// This function really doesn't scale...
function selectCardEventHandler(card, i)
{
  // Can't select the same card twice.
  if(!compareFlag || selectedCards.includes(i))
    return;
  if(selectedCards.length === 0)
  {
    card.style.borderColor = "red";
    selectedCards.push(i);
  }
  else if(selectedCards.length === 1)
  {
    selectedCards.push(i);
    displayComparisons(selectedCards[0], selectedCards[1]);
  }
}

// Function removes all cards and displays the full data of the two selected cats.
// When return button is clicked, the site will return to default view.
function displayComparisons(a, b)
{
  const cardContainer = document.getElementById("card-container");
  const infoPanel = document.getElementById("infoPanel");
  const sortMenu = document.getElementById("sortMenu");
  const footer = document.querySelector(".footer");

  const cat1 = bigCats[a];
  const cat2 = bigCats[b];

  // Clear the current display and any text or item in the infoPanel; hides drop-down menu and buttons.
  cardContainer.innerHTML = "";
  infoPanel.innerHTML = "";
  sortMenu.style.display = "none";
  footer.style.display = "none";
  
  // Create new cards for the two.
  const templateCard = document.querySelector(".card");
  const card1 = templateCard.cloneNode(true);
  const card2 = templateCard.cloneNode(true);
  editCardContent(card1, cat1);
  editCardContent(card2, cat2);
  highlightGreaterValues(card1, cat1, card2, cat2);
  cardContainer.appendChild(card1);
  cardContainer.appendChild(card2);

  // Create return button at bottom of screen.
  const backButton = document.createElement("button");
  backButton.textContent = "⬅️RETURN";
  backButton.style.position = "fixed";
  backButton.style.bottom = "20px";
  backButton.style.left = "20px";
  // We need to return all the styles to default after return is clicked.
  backButton.onclick = () =>
  {
    compareFlag = false;
    selectedCards = [];
    infoPanel.innerHTML = "";
    sortMenu.style.display = "block";
    footer.style.display = "flex";
    showCards();
  };
  cardContainer.appendChild(backButton);
}

// Reset the borders to their original color.
function resetCardBorders()
{
  const deck = document.querySelectorAll(".card");
  deck.forEach((card) =>
  {
      card.style.borderColor =  "rgb(250, 217, 198)";
  });
}

// Function highlights the higher numerical value out of the cards in green.
function highlightGreaterValues(card1, cat1, card2, cat2)
{
  const categories = ["lifespan", "speed", "length", "mass", "biteForce"];
  
  categories.forEach(category => 
  {
    const card1Color = card1.querySelector(`.${category}`);
    const card2Color = card2.querySelector(`.${category}`);

    if(Array.isArray(cat1[category]))
    {
      card1Val = cat1[category][1];
      card2Val = cat2[category][1];
    }
    else
    {
      card1Val = cat1[category];
      card2Val = cat2[category];
    }

    if(card1Val > card2Val)
      card1Color.style.color = "green";
    else
      card2Color.style.color = "green";
  });
}
