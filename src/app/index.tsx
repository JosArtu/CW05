import { Link, type Href } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const pokemonApi = "https://pokeapi.co/api/v2/pokemon?limit=10";

interface Pokemon {
  name: string;
  image: string;
  imageBack: string;
  types: PokemonType[] ;
}

interface PokemonType {
  slot: number;
  type: {
    name: string;
    url: string;
  };
}

const typeColors: Record<string, string> = {
  grass: "#8bd15e",
  fire: "#f39a76",
  water: "#82c9e8",
  bug: "#b5d76b",
  normal: "#d4d0a8",
  poison: "#bd91cf",
  electric: "#f2d46f",
  ground: "#dfb783",
  fairy: "#efb1c7",
  fighting: "#e28d82",
  psychic: "#ee9bb5",
  rock: "#c9b27c",
  ghost: "#a79acb",
  ice: "#9edbd2",
  dragon: "#a995df",
  dark: "#a49a91",
  steel: "#b9c4ce",
  flying: "#a9b9e5",
};

export default function Index() {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let isCurrent = true;

    async function fetchPokemons() {
      setIsLoading(true);
      setHasError(false);

      try {
        const response = await fetch(pokemonApi);
        if (!response.ok) throw new Error("Could not load Pokémon");

        const data: { results: { name: string; url: string }[] } =
          await response.json();
        const detailPokemons = await Promise.all(
          data.results.map(async (pokemon) => {
            const res = await fetch(pokemon.url);
            if (!res.ok) throw new Error("Could not load Pokémon details");

            const details = await res.json();

            return {
              name: pokemon.name,
              image: details.sprites.front_default ?? "",
              imageBack: details.sprites.back_default ?? "",
              types: details.types,
            };
          }),
        );

        if (isCurrent) setPokemons(detailPokemons);
      } catch {
        if (isCurrent) setHasError(true);
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    }

    fetchPokemons();
    return () => {
      isCurrent = false;
    };
  }, [retryCount]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.heading}>
        <Text style={styles.eyebrow}>POKÉMON DIRECTORY</Text>
        <Text style={styles.title}>Pokédex</Text>
        <Text style={styles.subtitle}>Browse Pokémon and tap one to see its details.</Text>
      </View>
      {isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#5c9d39" />
          <Text style={styles.statusText}>Loading Pokémon…</Text>
        </View>
      ) : hasError ? (
        <View style={styles.messageCard}>
          <Text style={styles.messageTitle}>Couldn’t load the Pokédex</Text>
          <Text style={styles.messageText}>Check your connection and try again.</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => setRetryCount((count) => count + 1)}
            style={styles.retryButton}
          >
            <Text style={styles.retryButtonText}>Try again</Text>
          </Pressable>
        </View>
      ) : (
        pokemons.map((pokemon) => {
          const primaryType = pokemon.types[0]?.type.name ?? "normal";

          return (
            <Link
              key={pokemon.name}
              href={
                {
                  pathname: "/details",
                  params: { name: pokemon.name },
                } as unknown as Href
              }
              asChild
            >
              <Pressable
                style={StyleSheet.flatten([
                  styles.card,
                  { backgroundColor: typeColors[primaryType] ?? "#d4d0a8" },
                ])}
                accessibilityLabel={`Ver detalles de ${pokemon.name}`}
              >
                <Text style={styles.name}>{pokemon.name}</Text>
                <Text style={styles.type}>
                  {pokemon.types.map(({ type }) => type.name).join(" / ")}
                </Text>
                <View style={styles.images}>
                  {pokemon.image ? (
                    <Image
                      source={{ uri: pokemon.image }}
                      style={styles.image}
                      resizeMode="contain"
                      accessibilityLabel={`${pokemon.name} front view`}
                    />
                  ) : null}
                  {pokemon.imageBack ? (
                    <Image
                      source={{ uri: pokemon.imageBack }}
                      style={styles.image}
                      resizeMode="contain"
                      accessibilityLabel={`${pokemon.name} back view`}
                    />
                  ) : null}
                </View>
              </Pressable>
            </Link>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7f2",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 28,
    gap: 14,
  },
  heading: {
    paddingHorizontal: 4,
    paddingBottom: 4,
  },
  eyebrow: {
    color: "#668156",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  title: {
    color: "#26351f",
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "800",
  },
  subtitle: {
    color: "#66715f",
    fontSize: 15,
    lineHeight: 21,
    marginTop: 3,
  },
  loading: {
    minHeight: 260,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  statusText: {
    color: "#66715f",
    fontSize: 15,
  },
  messageCard: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 24,
    gap: 10,
  },
  messageTitle: {
    color: "#34442b",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  messageText: {
    color: "#66715f",
    fontSize: 15,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#4e7b38",
    borderRadius: 12,
    marginTop: 4,
    paddingHorizontal: 18,
    paddingVertical: 11,
  },
  retryButtonText: {
    color: "#ffffff",
    fontWeight: "700",
  },
  card: {
    minHeight: 244,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  name: {
    color: "#34442b",
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "800",
    textAlign: "center",
    textTransform: "lowercase",
  },
  type: {
    color: "#465b3b",
    fontSize: 21,
    lineHeight: 27,
    fontWeight: "700",
    textAlign: "center",
    textTransform: "lowercase",
    marginTop: 2,
  },
  images: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    gap: 18,
  },
  image: {
    width: 96,
    height: 96,
  },
});
