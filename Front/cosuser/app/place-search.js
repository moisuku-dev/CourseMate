// app/place-search.js
import React, { useEffect, useState } from "react";
import { View, Text, TextInput, FlatList, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import ScreenContainer from "../components/ScreenContainer";
import COLORS from "../constants/colors";
import PlaceCard from "../components/PlaceCard";
import { fetchPlaces } from "../api/places";

export default function PlaceSearchScreen() {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadPlaces = async () => {
    setLoading(true);
    try {
      const data = await fetchPlaces({ keyword });
      setPlaces(data || []);
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlaces();
  }, []);

  return (
    <ScreenContainer>
      <Text style={styles.title}>관광지 검색</Text>

      <TextInput
        style={styles.input}
        placeholder="지역명, 관광지명, 태그 등으로 검색"
        value={keyword}
        onChangeText={setKeyword}
        onSubmitEditing={loadPlaces}
      />

      <FlatList
        data={places}
        keyExtractor={(item) => String(item.id)}
        refreshing={loading}
        onRefresh={loadPlaces}
        renderItem={({ item }) => (
          <PlaceCard
            place={item}
            onPress={() => router.push(`/place/${item.id}`)}
          />
        )}
        ListEmptyComponent={
          !loading && (
            <Text style={styles.empty}>검색 결과가 없습니다.</Text>
          )
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
    color: COLORS.text,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    marginBottom: 12,
  },
  empty: {
    marginTop: 16,
    textAlign: "center",
    color: COLORS.muted,
  },
});
