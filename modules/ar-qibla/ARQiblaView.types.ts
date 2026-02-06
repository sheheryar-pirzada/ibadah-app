import { ViewProps } from 'react-native';

export type TrackingState =
  | 'notAvailable'
  | 'initializing'
  | 'normal'
  | 'excessiveMotion'
  | 'insufficientFeatures'
  | 'relocalizing'
  | 'unknown';

export interface ARQiblaViewProps extends ViewProps {
  /**
   * Qibla bearing in degrees (0-360) from the user's location
   * This comes from the useLocation hook's qibla value
   */
  qiblaBearing: number;

  /**
   * Whether the AR session should be active
   * @default true
   */
  isActive?: boolean;

  /**
   * Callback when AR tracking state changes
   */
  onTrackingStateChange?: (state: TrackingState) => void;
}
