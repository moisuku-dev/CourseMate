// components/PlaceCard.js
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import COLORS from "../constants/colors";

export default function PlaceCard({ place, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {place.thumbnail && (
        <Image source={{ uri: place.thumbnail }} style={styles.thumbnail} />
      )}
      <View style={styles.info}>
        <Text style={styles.name}>{place.name}</Text>
        {place.tags && (
          <Text style={styles.tags}>{place.tags.join(" · ")}</Text>
        )}
        {place.shortDescription && (
          <Text style={styles.desc} numberOfLines={2}>
            {place.shortDescription}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    borderRadius: 16,
    backgroundColor: COLORS.card,
    padding: 12,
    marginVertical: 6,
  },
  thumbnail: {
    width: 72,
    height: 72,
    borderRadius: 12,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  tags: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 2,
  },
  desc: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 4,
  },
});
