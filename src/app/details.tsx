import React, { useEffect, useState } from 'react';
import { Stack, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from 'react-native';

interface PokemonDetail {
  id: number;
  name: string;
  height: number;
  weight: number;
  sprites: {
    front_default: string | null;
    back_default: string | null;
  };
  types: { type: { name: string } }[];
  abilities: { ability: { name: string } }[];
}

const typeColors: Record<string, string> = {
  grass: '#8bd15e',
  fire: '#f39a76',
  water: '#82c9e8',
  bug: '#b5d76b',
  normal: '#d4d0a8',
  poison: '#bd91cf',
  electric: '#f2d46f',
  ground: '#dfb783',
  fairy: '#efb1c7',
  fighting: '#e28d82',
  psychic: '#ee9bb5',
  rock: '#c9b27c',
  ghost: '#a79acb',
  ice: '#9edbd2',
  dragon: '#a995df',
  dark: '#a49a91',
  steel: '#b9c4ce',
  flying: '#a9b9e5',
};

export default function PokemonDetailScreen() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const [pokemon, setPokemon] = useState<PokemonDetail | null>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isCurrent = true;

    async function fetchPokemon() {
      try {
        setPokemon(null);
        setHasError(false);
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(name)}`);

        if (!response.ok) {
          throw new Error('Pokémon not found');
        }

        const details: PokemonDetail = await response.json();
        if (isCurrent) setPokemon(details);
      } catch {
        if (isCurrent) setHasError(true);
      }
    }

    fetchPokemon();
    return () => {
      isCurrent = false;
    };
  }, [name]);

  const primaryType = pokemon?.types[0]?.type.name ?? 'grass';

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ title: pokemon?.name ?? 'Pokémon' }} />
      {pokemon ? (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={[styles.hero, { backgroundColor: typeColors[primaryType] ?? '#d4d0a8' }]}>
            <Text style={styles.number}>#{String(pokemon.id).padStart(3, '0')}</Text>
            <Text style={styles.name}>{pokemon.name}</Text>
            <Text style={styles.type}>
              {pokemon.types.map(({ type }) => type.name).join(' / ')}
            </Text>
            <View style={styles.sprites}>
              {pokemon.sprites.front_default ? (
                <Image source={{ uri: pokemon.sprites.front_default }} style={styles.sprite} />
              ) : null}
              {pokemon.sprites.back_default ? (
                <Image source={{ uri: pokemon.sprites.back_default }} style={styles.sprite} />
              ) : null}
            </View>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.sectionTitle}>Características</Text>
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Altura</Text>
                <Text style={styles.statValue}>{(pokemon.height / 10).toFixed(1)} m</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Peso</Text>
                <Text style={styles.statValue}>{(pokemon.weight / 10).toFixed(1)} kg</Text>
              </View>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.sectionTitle}>Habilidades</Text>
            <Text style={styles.abilities}>
              {pokemon.abilities.map(({ ability }) => ability.name.replace('-', ' ')).join(' · ')}
            </Text>
          </View>
        </ScrollView>
      ) : (
        <View style={styles.status}>
          {hasError ? (
            <Text style={styles.error}>No se pudieron cargar los datos del Pokémon.</Text>
          ) : (
            <ActivityIndicator size="large" color="#5c9d39" />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f5f7f2',
  },
  content: {
    padding: 16,
    paddingBottom: 28,
    gap: 14,
  },
  hero: {
    minHeight: 300,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 22,
    paddingHorizontal: 16,
  },
  number: {
    color: '#465b3b',
    fontSize: 14,
    fontWeight: '700',
  },
  name: {
    color: '#34442b',
    fontSize: 30,
    lineHeight: 38,
    fontWeight: '800',
    textTransform: 'lowercase',
  },
  type: {
    color: '#465b3b',
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '700',
    textTransform: 'lowercase',
  },
  sprites: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginTop: 10,
  },
  sprite: {
    width: 112,
    height: 112,
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
  },
  sectionTitle: {
    color: '#34442b',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 14,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: 5,
  },
  statLabel: {
    color: '#77816f',
    fontSize: 14,
  },
  statValue: {
    color: '#34442b',
    fontSize: 18,
    fontWeight: '700',
  },
  statDivider: {
    width: 1,
    height: 38,
    backgroundColor: '#e2e8dc',
  },
  abilities: {
    color: '#465b3b',
    fontSize: 16,
    lineHeight: 23,
    textTransform: 'capitalize',
  },
  status: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  error: {
    color: '#8f3d32',
    fontSize: 16,
    textAlign: 'center',
  },
});
