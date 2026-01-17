import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Colors } from '../constants/Colors';

type Role = 'student' | 'faculty';

interface RoleToggleProps {
  role: Role;
  onToggle: (role: Role) => void;
}

const TOGGLE_WIDTH = 280;
const TOGGLE_HEIGHT = 50;
const PADDING = 4;

export default function RoleToggle({ role, onToggle }: RoleToggleProps) {
  const isFaculty = role === 'faculty';

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: withSpring(isFaculty ? (TOGGLE_WIDTH / 2) - PADDING : PADDING, {
            damping: 15,
            stiffness: 120,
          }),
        },
      ],
    };
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.slider, animatedStyle]} />
      <TouchableOpacity
        style={styles.option}
        onPress={() => onToggle('student')}
        activeOpacity={0.8}
      >
        <Text style={[styles.text, !isFaculty && styles.activeText]}>Student</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.option}
        onPress={() => onToggle('faculty')}
        activeOpacity={0.8}
      >
        <Text style={[styles.text, isFaculty && styles.activeText]}>Faculty</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: TOGGLE_WIDTH,
    height: TOGGLE_HEIGHT,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 25,
    flexDirection: 'row',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  slider: {
    position: 'absolute',
    width: (TOGGLE_WIDTH / 2) - PADDING,
    height: TOGGLE_HEIGHT - (PADDING * 2),
    backgroundColor: Colors.secondary,
    borderRadius: 21,
    top: PADDING,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  option: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
  },
  activeText: {
    color: Colors.primary,
    fontWeight: '700',
  },
});
