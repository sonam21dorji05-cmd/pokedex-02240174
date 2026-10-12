const BASE = 'https://pokeapi.co/api/v2';

export const getIdFromUrl = (url) => {
  const parts = url.split('/').filter(Boolean);
  return Number(parts[parts.length - 1]);
};

export const getArtworkUrl = (id) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Request failed (${res.status})`);
  }
  return res.json();
}

// One page of Pokémon: returns [{ id, name }]
export async function fetchPokemonPage(offset, limit = 20) {
  const data = await getJson(`${BASE}/pokemon?offset=${offset}&limit=${limit}`);
  return data.results.map((p) => ({ id: getIdFromUrl(p.url), name: p.name }));
}

// Every Pokémon name, used for search
export async function fetchAllPokemon() {
  const data = await getJson(`${BASE}/pokemon?limit=1025`);
  return data.results.map((p) => ({ id: getIdFromUrl(p.url), name: p.name }));
}

// Full details of one Pokémon
export async function fetchPokemonDetails(idOrName) {
  return getJson(`${BASE}/pokemon/${idOrName}`);
}