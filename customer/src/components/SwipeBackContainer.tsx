import React, { useRef } from "react";
import { PanResponder, StyleProp, View, ViewStyle } from "react-native";

interface SwipeBackContainerProps {
  children: React.ReactNode;
  onBack: () => void;
  enabled?: boolean;
  edgeWidth?: number; // Only touches starting within this distance from the left edge
  threshold?: number; // Minimum horizontal drag to trigger onBack
  style?: StyleProp<ViewStyle>;
}

/**
 * SwipeBackContainer
 * Enables native-like edge-swipe gesture: swiping right from the left edge of the screen
 * goes back to the previous screen or closes the active modal/view.
 */
export function SwipeBackContainer({
  children,
  onBack,
  enabled = true,
  edgeWidth = 60,
  threshold = 60,
  style,
}: SwipeBackContainerProps) {
  const onBackRef = useRef(onBack);
  onBackRef.current = onBack;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        if (!enabled) return false;
        const startX = evt.nativeEvent.pageX - gestureState.dx;
        const isStartedNearEdge = startX <= edgeWidth;
        const isSwipingRight = gestureState.dx > 12;
        const isHorizontal = Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 1.4;
        return isStartedNearEdge && isSwipingRight && isHorizontal;
      },
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => {
        if (!enabled) return false;
        const startX = evt.nativeEvent.pageX - gestureState.dx;
        const isStartedNearEdge = startX <= edgeWidth;
        const isSwipingRight = gestureState.dx > 18;
        const isHorizontal = Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 1.4;
        return isStartedNearEdge && isSwipingRight && isHorizontal;
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx >= threshold || gestureState.vx > 0.35) {
          onBackRef.current();
        }
      },
      onPanResponderTerminate: () => {},
    })
  ).current;

  return (
    <View {...panResponder.panHandlers} style={[{ flex: 1 }, style]}>
      {children}
    </View>
  );
}
