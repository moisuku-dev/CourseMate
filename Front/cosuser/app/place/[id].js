// app/place/[id].js
import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  Alert,
  Linking,
  StyleSheet,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { fetchPlaceDetail, fetchPlacePhotos } from "../../api/places";
import { fetchPlaceReviews } from "../../api/reviews";
import {
  fetchWishlist,
  addToWishlist,
  removeFromWishlist,
} from "../../api/user";
import COLORS from "../../constants/colors";
import ScreenContainer from "../../components/ScreenContainer";

export default function PlaceDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [place, setPlace] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const isInWishlist = useMemo(() => {
    return wishlist.some((item) => String(item.placeId) === String(id));
  }, [wishlist, id]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [placeRes, photoRes, reviewRes, wishRes] = await Promise.all([
          fetchPlaceDetail(id),
          fetchPlacePhotos(id),
          fetchPlaceReviews(id),
          fetchWishlist(),
        ]);

        setPlace(placeRes);
        setPhotos(photoRes?.photos || photoRes || []);
        setReviews(reviewRes?.reviews || reviewRes || []);
        setWishlist(wishRes?.wishlist || wishRes || []);
      } catch (e) {
        console.error(e);
        Alert.alert("오류", "관광지 정보를 불러오는 중 문제가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const toggleWishlist = async () => {
    try {
      setWishlistLoading(true);
      if (isInWishlist) {
        await removeFromWishlist(id);
      } else {
        await addToWishlist(id);
      }
      const updated = await fetchWishlist();
      setWishlist(updated?.wishlist || updated || []);
    } catch (e) {
      console.error(e);
      Alert.alert("오류", "위시리스트 처리 중 문제가 발생했습니다.");
    } finally {
      setWishlistLoading(false);
    }
  };

  const openNaverMap = () => {
    if (!place) return;
    const query = encodeURIComponent(place.name || place.placeName || "");
    const url = `https://map.naver.com/v5/search/${query}`;
    Linking.openURL(url).catch(() => {
      Alert.alert("오류", "네이버 지도를 열 수 없습니다.");
    });
  };

  // 참고한 블로그 목록 처리
  const blogList = useMemo(() => {
    // 케이스 1: [{ id, title, url }]
    if (Array.isArray(place?.blogs)) return place.blogs;
    // 케이스 2: [{ title, link }]
    if (Array.isArray(place?.referenceBlogs)) return place.referenceBlogs;
    // 케이스 3: ["https://...", "https://..."]
    if (Array.isArray(place?.blogUrls)) {
      return place.blogUrls.map((url, idx) => ({
        id: idx,
        title: url,
        url,
      }));
    }
    return [];
  }, [place]);

  const openBlog = (url) => {
    if (!url) return;
    Linking.openURL(url).catch(() => {
      Alert.alert("오류", "브로그 링크를 열 수 없습니다.");
    });
  };

  if (loading || !place) {
    return (
      <ScreenContainer>
        {loading ? (
          <ActivityIndicator />
        ) : (
          <Text>관광지 정보를 찾을 수 없습니다.</Text>
        )}
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView>
        {/* 제목 + 위시리스트 버튼 */}
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>
              {place.name || place.placeName || "관광지"}
            </Text>
            {!!place.address && (
              <Text style={styles.address}>{place.address}</Text>
            )}
          </View>

          <TouchableOpacity
            onPress={toggleWishlist}
            disabled={wishlistLoading}
            style={[
              styles.wishButton,
              { backgroundColor: isInWishlist ? "#F97316" : COLORS.primary },
            ]}
          >
            <Text style={styles.wishButtonText}>
              {isInWishlist ? "위시리스트 제거" : "위시리스트 추가"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 네이버 길찾기 */}
        <TouchableOpacity onPress={openNaverMap} style={styles.naverButton}>
          <Text style={styles.naverButtonText}>네이버 지도에서 길찾기</Text>
        </TouchableOpacity>

        {/* 사진 섹션 */}
        <Text style={styles.sectionTitle}>사진</Text>
        {photos.length > 0 ? (
          <FlatList
            data={photos}
            keyExtractor={(item, idx) => String(item.photoId || idx)}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <Image
                source={{ uri: item.url || item.photoUrl }}
                style={styles.photo}
              />
            )}
          />
        ) : (
          <Text style={styles.emptyText}>등록된 사진이 없습니다.</Text>
        )}

        {/* 소개 */}
        {!!place.description && (
          <>
            <Text style={styles.sectionTitle}>소개</Text>
            <Text style={styles.description}>{place.description}</Text>
          </>
        )}

        {/* 참고한 블로그 섹션 */}
        <Text style={styles.sectionTitle}>참고한 블로그</Text>
        {blogList.length === 0 ? (
          <Text style={styles.emptyText}>등록된 참고 블로그가 없습니다.</Text>
        ) : (
          blogList.map((b, idx) => (
            <TouchableOpacity
              key={b.id || idx}
              onPress={() => openBlog(b.url || b.link || b)}
              style={styles.blogItem}
            >
              <Text style={styles.blogTitle}>
                {b.title || b.url || b.link}
              </Text>
              <Text style={styles.blogLink} numberOfLines={1}>
                {b.url || b.link || ""}
              </Text>
            </TouchableOpacity>
          ))
        )}

        {/* 리뷰 헤더 + 작성 버튼 */}
        <View style={styles.reviewHeaderRow}>
          <Text style={styles.sectionTitle}>리뷰 및 별점</Text>
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/review-write",
                params: {
                  placeId: id,
                  placeName: place.name || place.placeName,
                },
              })
            }
            style={styles.reviewButton}
          >
            <Text style={styles.reviewButtonText}>리뷰 작성하기</Text>
          </TouchableOpacity>
        </View>

        {/* 리뷰 목록 */}
        {reviews.length === 0 ? (
          <Text style={styles.emptyText}>아직 등록된 리뷰가 없습니다.</Text>
        ) : (
          reviews.map((r) => (
            <View
              key={r.reviewId || r.id}
              style={styles.reviewItem}
            >
              <Text style={styles.reviewTitle}>
                ★ {r.rating} / 5{" "}
                <Text style={styles.reviewUser}>
                  {r.nickname || r.userName || ""}
                </Text>
              </Text>
              <Text style={styles.reviewContent}>{r.content}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.text,
  },
  address: {
    marginTop: 4,
    color: COLORS.muted,
  },
  wishButton: {
    marginLeft: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    alignSelf: "flex-start",
  },
  wishButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
  },
  naverButton: {
    marginTop: 4,
    marginBottom: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
    alignSelf: "flex-start",
  },
  naverButtonText: {
    color: COLORS.primary,
    fontWeight: "600",
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 8,
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  photo: {
    width: 200,
    height: 140,
    borderRadius: 12,
    marginRight: 10,
    backgroundColor: "#eee",
  },
  emptyText: {
    color: COLORS.muted,
  },
  description: {
    color: COLORS.text,
    lineHeight: 20,
  },
  blogItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  blogTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
  },
  blogLink: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 2,
  },
  reviewHeaderRow: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reviewButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
  },
  reviewButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
  },
  reviewItem: {
    marginTop: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  reviewTitle: {
    fontWeight: "600",
    color: COLORS.text,
  },
  reviewUser: {
    fontWeight: "400",
    color: COLORS.muted,
  },
  reviewContent: {
    marginTop: 4,
    color: COLORS.text,
  },
});
