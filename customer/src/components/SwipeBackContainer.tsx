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
      onStartShouldSetPanResponder: (evt) => {
        if (!enabled) return false;
        // Only initiate if the finger touches near the left screen edge
        return evt.nativeEvent.pageX <= edgeWidth;
      },
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        if (!enabled) return false;
        // Only capture if touch originated near the left edge and is dragging rightward horizontally
        const isNearEdge = evt.nativeEvent.pageX <= edgeWidth + 80;
        const isSwipingRight = gestureState.dx > 15;
        const isHorizontal = Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 1.3;
        return isNearEdge && isSwipingRight && isHorizontal;
      },
      onPanResponderRelease: (_, gestureState) => {
        // Trigger back action if dragged past threshold or swiped with quick flick
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
