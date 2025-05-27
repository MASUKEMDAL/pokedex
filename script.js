        const pokemonNameInput = document.getElementById('pokemon-name-input');
        const searchButton = document.getElementById('search-button');
        const pokemonDisplay = document.getElementById('pokemon-display');
        const prevPokemonButton = document.getElementById('prev-pokemon');
        const nextPokemonButton = document.getElementById('next-pokemon');

        let currentPokemonId = null; // Para controlar o Pokémon atual e a navegação

        // Função para buscar informações do Pokémon
        async function fetchPokemon(identifier) { // Aceita nome ou ID
            try {
                pokemonDisplay.innerHTML = '<p class="loading-message">Buscando Pokémon...</p>'; // Mensagem de carregamento
                const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${identifier}`);

                if (!response.ok) {
                    throw new Error('Pokémon não encontrado!');
                }

                const data = await response.json();
                currentPokemonId = data.id; // Atualiza o ID do Pokémon atual

                // Buscar informações de evolução (requer uma segunda chamada à API)
                const speciesResponse = await fetch(data.species.url);
                const speciesData = await speciesResponse.json();

                const evolutionChainResponse = await fetch(speciesData.evolution_chain.url);
                const evolutionChainData = await evolutionChainResponse.json();

                // Exibir as informações no visor
                displayPokemonInfo(data, evolutionChainData);

            } catch (error) {
                pokemonDisplay.innerHTML = `<p style="color: red;">Erro: ${error.message}</p>`;
                currentPokemonId = null; // Reseta o ID se houver erro
            }
        }

        // Função para exibir as informações no visor
        function displayPokemonInfo(pokemonData, evolutionChainData) {
            const pokemonImageUrl = pokemonData.sprites.front_default;

            let abilitiesHtml = '<h3>Habilidades:</h3><ul>';
            pokemonData.abilities.forEach(abilityInfo => {
                abilitiesHtml += `<li>${abilityInfo.ability.name}</li>`;
            });
            abilitiesHtml += '</ul>';

            let statsHtml = '<h3>Estatísticas Base:</h3><ul>';
            pokemonData.stats.forEach(statInfo => {
                statsHtml += `<li>${capitalizeFirstLetter(statInfo.stat.name)}: ${statInfo.base_stat}</li>`;
            });
            statsHtml += '</ul>';

            let evolutionsHtml = '<h3>Evoluções:</h3>';
            const evolutionNames = getEvolutionNames(evolutionChainData.chain);
            if (evolutionNames.length > 0) {
                evolutionsHtml += evolutionNames.join(' → ');
            } else {
                evolutionsHtml += 'Não possui evoluções registradas.';
            }


            pokemonDisplay.innerHTML = `
                <img src="${pokemonImageUrl}" alt="${capitalizeFirstLetter(pokemonData.name)}" class="pokemon-image">
                <h2>${capitalizeFirstLetter(pokemonData.name)} (#${pokemonData.id})</h2>
                <p>Tipo(s): ${pokemonData.types.map(typeInfo => typeInfo.type.name).join(', ')}</p>
                <p>Altura: ${pokemonData.height / 10} m</p> <!-- Altura em metros -->
                <p>Peso: ${pokemonData.weight / 10} kg</p> <!-- Peso em quilogramas -->
                ${abilitiesHtml}
                ${statsHtml}
                ${evolutionsHtml}
            `;
        }

        // Função auxiliar para capitalizar a primeira letra de uma string
        function capitalizeFirstLetter(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        }

        // Função para extrair os nomes das evoluções da cadeia
        function getEvolutionNames(chain) {
            const evolutionNames = [];
            let current = chain;

            while (current) {
                evolutionNames.push(capitalizeFirstLetter(current.species.name));
                current = current.evolves_to[0]; // Pega a primeira evolução na cadeia
            }
            return evolutionNames;
        }


        // Adicionar evento ao botão de pesquisa
        searchButton.addEventListener('click', () => {
            const pokemonName = pokemonNameInput.value.trim();
            if (pokemonName) {
                fetchPokemon(pokemonName);
            } else {
                pokemonDisplay.innerHTML = '<p style="color: yellow;">Por favor, digite o nome de um Pokémon.</p>';
                currentPokemonId = null;
            }
        });

        // Permitir pesquisa pressionando Enter no campo de input
        pokemonNameInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                searchButton.click(); // Simula o clique no botão de pesquisa
            }
        });

        // Adicionar evento para o botão de Pokémon anterior (seta para cima no D-pad)
        prevPokemonButton.addEventListener('click', () => {
            if (currentPokemonId !== null && currentPokemonId > 1) {
                fetchPokemon(currentPokemonId - 1);
            }
        });

        // Adicionar evento para o botão de Pokémon seguinte (seta para baixo no D-pad)
        nextPokemonButton.addEventListener('click', () => {
            if (currentPokemonId !== null) {
                 // A PokeAPI tem um limite no número total de Pokémon.
                 // Para evitar erros ao ir além do último, podemos adicionar uma verificação
                 // ou simplesmente deixar a API retornar o erro.
                 // Para simplificar, vamos apenas tentar buscar o próximo.
                fetchPokemon(currentPokemonId + 1);
            }
        });