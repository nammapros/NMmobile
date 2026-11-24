import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ServiceBannerAssets } from "../assets";
import { useApp } from "../state/AppContext";
import { colors, radii, spacing } from "../theme";

export function RatingModal() {
  const {
    isRatingModalOpen,
    setIsRatingModalOpen,
    ratingBooking,
    setRatingBooking,
  } = useApp();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!isRatingModalOpen || !ratingBooking) return null;

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => {
      Alert.alert(
        "Thank You!",
        "Your review has been submitted successfully. We appreciate your feedback!"
      );
      setSubmitted(false);
      setComment("");
      setRating(5);
      setIsRatingModalOpen(false);
      setRatingBooking(null);
    }, 400);
  };

  const getBookingThumb = (name?: string) => {
    const n = (name || "").toLowerCase();
    if (n.includes("water") || n.includes("tank")) {
      return ServiceBannerAssets["water-tank-cleaning"];
    }
    if (n.includes("ac")) {
      return ServiceBannerAssets.ac;
    }
    return ServiceBannerAssets["washing-machine"];
  };

  return (
    <Modal
      visible={isRatingModalOpen}
      animationType="slide"
      transparent={false}
      onRequestClose={() => setIsRatingModalOpen(false)}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* ========================================================
            SCREEN 20: RATE YOUR SERVICE
            ======================================================== */}
        <View style={styles.header}>
          <Pressable
            onPress={() => setIsRatingModalOpen(false)}
            style={styles.headerBtn}
          >
            <Ionicons name="arrow-back" size={24} color={colors.ink} />
          </Pressable>
          <Text style={styles.headerTitle}>Rate Your Service</Text>
          <View style={{ width: 36 }} />
        </View>

        <View style={styles.content}>
          {/* Service Thumbnail & Title Card */}
          <View style={styles.serviceCard}>
            <Image
              source={getBookingThumb(ratingBooking.service_name || ratingBooking.service)}
              style={styles.serviceThumb}
              resizeMode="cover"
            />
            <View style={styles.serviceCardTextWrap}>
              <Text style={styles.serviceName}>
                {ratingBooking.service_name || ratingBooking.service}
              </Text>
              <Text style={styles.serviceSub}>Completed Service</Text>
            </View>
          </View>

          {/* 5 Interactive Rating Stars matching Mockup */}
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((starVal) => {
              const isFilled = rating >= starVal;
              return (
                <Pressable
                  key={starVal}
                  onPress={() => setRating(starVal)}
                  style={styles.starBtn}
                >
                  <Ionicons
                    name={isFilled ? "star" : "star-outline"}
                    size={38}
                    color={isFilled ? "#EAB308" : colors.subtle}
                  />
                </Pressable>
              );
            })}
          </View>

          {/* Text Input for Review */}
          <TextInput
            placeholder="Share your experience (optional)"
            placeholderTextColor={colors.subtle}
            value={comment}
            onChangeText={setComment}
            style={styles.reviewInput}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Submit Review Pill Button */}
        <View style={styles.bottomBar}>
          <Pressable
            onPress={handleSubmit}
            style={styles.submitBtn}
            accessibilityRole="button"
            accessibilityLabel="Submit Review"
          >
            <Text style={styles.submitBtnText}>Submit Review</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    height: 52,
  },
  headerBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.ink,
  },
  content: {
    flex: 1,
    padding: spacing.xl,
    gap: spacing.xl,
  },
  serviceCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.canvasWarm,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.md,
  },
  serviceThumb: {
    width: 54,
    height: 54,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
  },
  serviceCardTextWrap: {
    flex: 1,
  },
  serviceName: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.ink,
  },
  serviceSub: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  starsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  starBtn: {
    padding: 4,
  },
  reviewInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.lg,
    fontSize: 14,
    color: colors.ink,
    minHeight: 120,
    textAlignVertical: "top",
  },
  bottomBar: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    backgroundColor: colors.surface,
  },
  submitBtn: {
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
});
