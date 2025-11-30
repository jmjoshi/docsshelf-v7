/**
 * Standardized Button Component
 * Consistent button styles across the app
 */

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';

export type ButtonVariant = 'primary' | 'secondary' | 'destructive' | 'ghost' | 'outline';
export type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: string;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const getButtonStyle = (): ViewStyle[] => {
    const baseStyle: ViewStyle[] = [styles.button, styles[`button_${size}`]];

    if (fullWidth) {
      baseStyle.push(styles.fullWidth);
    }

    switch (variant) {
      case 'primary':
        baseStyle.push({
          backgroundColor: Colors.primary,
        } as ViewStyle);
        break;
      case 'secondary':
        baseStyle.push({
          backgroundColor: isDark ? '#2c2c2e' : '#f0f0f0',
        } as ViewStyle);
        break;
      case 'destructive':
        baseStyle.push({
          backgroundColor: '#ef4444',
        } as ViewStyle);
        break;
      case 'ghost':
        baseStyle.push({
          backgroundColor: 'transparent',
        } as ViewStyle);
        break;
      case 'outline':
        baseStyle.push({
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: Colors.primary,
        } as ViewStyle);
        break;
    }

    if (disabled || loading) {
      baseStyle.push({ opacity: 0.5 } as ViewStyle);
    }

    return baseStyle;
  };

  const getTextColor = () => {
    switch (variant) {
      case 'primary':
      case 'destructive':
        return '#ffffff';
      case 'secondary':
        return Colors[colorScheme ?? 'light'].text;
      case 'ghost':
      case 'outline':
        return Colors.primary;
      default:
        return '#ffffff';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 16;
      case 'medium':
        return 20;
      case 'large':
        return 24;
    }
  };

  return (
    <TouchableOpacity
      style={[...getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}>
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator color={getTextColor()} size="small" />
        ) : (
          <>
            {icon && iconPosition === 'left' && (
              <IconSymbol
                name={icon as any}
                size={getIconSize()}
                color={getTextColor()}
                style={styles.iconLeft}
              />
            )}
            <Text style={[styles.text, styles[`text_${size}`], { color: getTextColor() }]}>
              {title}
            </Text>
            {icon && iconPosition === 'right' && (
              <IconSymbol
                name={icon as any}
                size={getIconSize()}
                color={getTextColor()}
                style={styles.iconRight}
              />
            )}
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

/**
 * Icon Button Component
 * Button with only an icon (minimum 44x44px for accessibility)
 */
interface IconButtonProps {
  icon: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  style?: ViewStyle;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onPress,
  variant = 'ghost',
  size = 'medium',
  disabled = false,
  style,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const getButtonSize = () => {
    switch (size) {
      case 'small':
        return 36;
      case 'medium':
        return 44; // Minimum touch target
      case 'large':
        return 56;
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 18;
      case 'medium':
        return 24;
      case 'large':
        return 28;
    }
  };

  const getBackgroundColor = () => {
    if (variant === 'ghost') return 'transparent';
    if (variant === 'primary') return Colors.primary;
    if (variant === 'destructive') return '#ef4444';
    return isDark ? '#2c2c2e' : '#f0f0f0';
  };

  const getIconColor = () => {
    if (variant === 'primary' || variant === 'destructive') return '#ffffff';
    if (variant === 'ghost' || variant === 'outline') return Colors.primary;
    return Colors[colorScheme ?? 'light'].text;
  };

  const buttonSize = getButtonSize();

  return (
    <TouchableOpacity
      style={[
        styles.iconButton,
        {
          width: buttonSize,
          height: buttonSize,
          borderRadius: buttonSize / 2,
          backgroundColor: getBackgroundColor(),
          opacity: disabled ? 0.5 : 1,
        },
        variant === 'outline' && {
          borderWidth: 1,
          borderColor: Colors.primary,
        },
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}>
      <IconSymbol name={icon as any} size={getIconSize()} color={getIconColor()} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  button_small: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  button_medium: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  button_large: {
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  fullWidth: {
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: Fonts.rounded,
    fontWeight: '600',
  },
  text_small: {
    fontSize: 14,
  },
  text_medium: {
    fontSize: 16,
  },
  text_large: {
    fontSize: 18,
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
