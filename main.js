// Déclaration de selectedPokemons en dehors de la fonction DOMContentLoaded
let selectedPokemons = [];

document.addEventListener('DOMContentLoaded', () => {
    // Récupérer les informations des Pokémon achetés depuis la localStorage
    selectedPokemons = JSON.parse(localStorage.getItem('selectedPokemons')) || [];

    // Afficher la liste complète des Pokémon
    displayPokemonList();

    // Vérifier si des informations de Pokémon ont été stockées
    if (selectedPokemons.length > 0) {
        // Afficher les cartes des Pokémon achetés
        displaySelectedPokemonCards();
    } else {
        // Afficher un message si aucune information n'a été trouvée
        const pokemonCardContainer = document.getElementById('pokemonCardContainer');
        pokemonCardContainer.innerHTML = '<h1>Le panier est vide.</h1>';
    }

    const clearCartButton = document.getElementById('clearCartButton');
    if (clearCartButton) {
        clearCartButton.addEventListener('click', clearCart);
    }
});


document.addEventListener('click', (event) => {
    const target = event.target;

    if (target.tagName === 'BUTTON' && target.textContent === 'Acheter') {
        const pokemonName = target.parentElement.querySelector('strong').textContent;

        const isAlreadyBought = selectedPokemons.some(p => p.name === pokemonName);
        if (!isAlreadyBought) {
            fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`)
                .then((response) => response.json())
                .then((pokemonData) => {
                    const pokemonToBuy = {
                        name: pokemonName,
                        image: pokemonData.sprites.front_default,
                        types: pokemonData.types.map(type => type.type.name),
                    };
                    selectedPokemons.push(pokemonToBuy);
                    localStorage.setItem('selectedPokemons', JSON.stringify(selectedPokemons));
                    displaySelectedPokemonCards();
                })
                .catch((error) => console.error('Erreur lors de la récupération des informations du Pokémon:', error));
        } else {
            console.log(`Le Pokémon ${pokemonName} a déjà été acheté.`);
        }
    }
});

function displayPokemonList() {
    fetch("https://pokeapi.co/api/v2/pokemon?limit=1008")
        .then((response) => response.json())
        .then((data) => {
            const pokemonListContainer = document.querySelector("#allPokemonList");
            const listElement = document.createElement("ul");
            listElement.classList.add("pokemon-list");

            data.results.forEach((pokemon) => {
                const listItem = document.createElement("li");
                const nameElement = document.createElement("strong");
                nameElement.textContent = pokemon.name;
                listItem.appendChild(nameElement);

                fetch(pokemon.url)
                    .then((response) => response.json())
                    .then((pokemonData) => {
                        const typesElement = document.createElement("div");
                        const typesText = "Types: " + pokemonData.types.map(type => `<strong>${type.type.name}</strong>`).join(", ");
                        typesElement.innerHTML = typesText;
                        listItem.appendChild(typesElement);

                        const imageElement = document.createElement("img");
                        imageElement.src = pokemonData.sprites.front_default;
                        imageElement.alt = pokemon.name;
                        listItem.appendChild(imageElement);

                        const buyButton = document.createElement("button");
                        buyButton.textContent = "Acheter";
                        listItem.appendChild(buyButton);
                    });

                listElement.appendChild(listItem);
            });

            pokemonListContainer.appendChild(listElement);
        });
}

function displaySelectedPokemonCards() {
    const pokemonCardContainer = document.getElementById('pokemonCardContainer');

    if (selectedPokemons.length === 0) {
        // Afficher un message lorsque le panier est vide
        pokemonCardContainer.innerHTML = '<h1>Le panier est vide.</h1>';
    } else {
        // Afficher les cartes des Pokémon achetés
        pokemonCardContainer.innerHTML = "";
        selectedPokemons.forEach((selectedPokemon) => {
            const pokemonCard = createPokemonCard(selectedPokemon);
            pokemonCardContainer.appendChild(pokemonCard);
        });
    }
}


function createPokemonCard(selectedPokemon) {
    const pokemonCard = document.createElement('div');
    const typesText = selectedPokemon.types ? selectedPokemon.types.join(', ') : 'Type non défini';
    pokemonCard.classList.add('pokemon-card');
    pokemonCard.innerHTML = `
        <div class="pokemon-content">
            <img src="${selectedPokemon.image}" alt="${selectedPokemon.name}">
            <div>
                <h2>${selectedPokemon.name}</h2>
                <p>Types: ${typesText}</p>
            </div>
        </div>
        <button class="remove-button" onclick="removePokemon('${selectedPokemon.name}')">Supprimer</button>
    `;
    return pokemonCard;
}


function removePokemon(pokemonName) {
    selectedPokemons = selectedPokemons.filter(p => p.name !== pokemonName);
    localStorage.setItem('selectedPokemons', JSON.stringify(selectedPokemons));
    displaySelectedPokemonCards();
}

function clearCart() {
    // Vider le tableau des Pokémon sélectionnés
    selectedPokemons = [];
    
    // Mettre à jour la localStorage
    localStorage.removeItem('selectedPokemons');
    
    // Afficher les cartes des Pokémon achetés
    displaySelectedPokemonCards();
}


document.querySelector("#searchButton").addEventListener("click", () => {
    const userInput = document.querySelector("#searchInput").value.toLowerCase();
    fetch(`https://pokeapi.co/api/v2/pokemon/${userInput}`)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Aucun Pokémon nommé "${userInput}" trouvé.`);
            }
            return response.json();
        })
        .then((data) => {
            const types = data.types.map(type => type.type.name).join(', ');
            
            document.querySelector("#searchList").innerHTML = `
                <h3>${data.name}</h3>
                <h3>Type(s): ${types}</h3>
                <img src="${data.sprites.front_default}" alt="${data.name}" />
            `;
        })
        .catch((error) => {
            document.querySelector("#searchList").innerHTML = `<p>Erreur : ${error.message}</p>`;
        });
});




    