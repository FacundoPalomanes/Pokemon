const textInput = document.getElementById("text_input");

textInput.addEventListener("keydown", function (event) {
  if (event.key == "Enter") {
    event.preventDefault();
    searchPokemon();
  }
});

renderAllCards(0);

async function searchPokemon() {
  try {
    if (textInput.value == "") {
      renderAllCards();
      return;
    }
    const getPokemon = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${textInput.value}`
    );
    const resp = await getPokemon.json();

    let cards = document.getElementById("cards");

    cards.innerHTML = `<button class="unbutton" onclick="fetchCard(${resp.id})">
    <div class="card">
        <img src="${resp.sprites.front_default}" alt="${resp.name}">
        <div class="card-content">
            <div class="card-title">${resp.name}</div>
            <div class="card-text">${resp.types
              .map((type) => type.type.name)
              .join(", ")}</div>
        </div>
        <div class="card-footer">#${resp.id}</div>
    </div>
    </button>`;
  } catch (err) {
    console.log(err);
    let cards = document.getElementById("error_text");
    return (cards.innerHTML =
      "There was an error, that pokemon didn't exists or try again");
  }
}

async function renderAllCards(offset) {
  const allPokemons = await fetch(
    `https://pokeapi.co/api/v2/pokemon?limit=300&offset=${offset}`
  );
  const data = await allPokemons.json();

  let cards = document.getElementById("cards");

  // Usamos map para obtener las promesas de cada fetch
  const promises = data.results.map(async (i) => {
    const fetchIndividualPokemon = await fetch(i.url);
    const pokemonData = await fetchIndividualPokemon.json();
    return `
    <button class="unbutton" onclick="fetchCard(${pokemonData.id})">
        <div class="card">
            <img src="${pokemonData.sprites.front_default}" alt="${pokemonData.name}">
              <div class="card-content">
                <div class="card-title">${pokemonData.name}</div>
                <div class="card-text">${pokemonData.types.map((type) => type.type.name).join(", ")}</div>
              </div>
            <div class="card-footer">#${pokemonData.id}</div>
        </div>
    </button>`;
  });

  const cardsHTML = await Promise.all(promises);

  cards.innerHTML = cardsHTML.join("");

  let pages = document.getElementById("pages");

  // Generar todos los botones dentro de un solo contenedor
  pages.innerHTML = `
    <div class="center_buttons">
      ${Array.from({ length: Math.ceil(data.count / 300) }, (_, index) => {
        const pageNumber = index;
        return `<a href="#return"><button class="page-button" onclick="renderAllCards(${pageNumber * 300})">${pageNumber + 1}</button><a/>`;}).join("")}</div>`;
}

async function fetchCard(id) {
  const getPokemon = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
  const resp = await getPokemon.json();

  let card = document.getElementById("one_card");

  card.innerHTML = `
  <div id="modal-overlay" class="modal-overlay">
    <div id="modal-card" class="modal-card">
      <img src="${resp.sprites.front_default}" alt="${resp.name}">
      <div class="card-content">
        <div class="card-title">${resp.name}</div>
        <div class="card-text-group">
          <div class="card-text"><strong>Types:</strong> ${resp.types.map((type) => type.type.name).join(", ")}</div>
          <div class="card-text"><strong>Weight:</strong> ${resp.weight}</div>
        </div>

        <div class="card-text-group">
          <div class="card-text"><strong>Base Experience:</strong> ${resp.base_experience}</div>
          <div class="card-text"><strong>Abilities:</strong> ${resp.abilities.map((ability) => ability.ability.name).join(", ")}</div>
        </div>
      </div>

      <div class="card-footer">#${resp.id}</div>
      <button id="close-modal" class="close-button">❌</button>
    </div>
  </div>`;


  const modalOverlay = document.getElementById("modal-overlay");
  const closeModal = document.getElementById("close-modal");

  // Mostrar el modal
  modalOverlay.classList.add("visible");

  // Ocultar el modal
  closeModal.addEventListener("click", () => {
    modalOverlay.classList.remove("visible");
    card.innerHTML = ""; // Limpia el modal del DOM al cerrarlo
  });

  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) {
      modalOverlay.classList.remove("visible");
      card.innerHTML = ""; // Limpia el modal del DOM al cerrarlo
    }
  });
}
