import { SharedValue } from "react-native-reanimated";

export interface CinematicCarouselItemProps<ItemT> {
  item: ItemT;
  index: number;
  scrollX: SharedValue<number>;
  renderItem: (info: { item: ItemT; index: number }) => React.ReactElement;
  itemWidth?: number;
  spacing?: number;
}

export interface CinematicCarouselProps<ItemT> {
  data: ItemT[];
  renderItem: (info: { item: ItemT; index: number }) => React.ReactElement;
  horizontalSpacing?: number;
  itemWidth?: number;
  spacing?: number;
  onActiveIndexChange?: (index: number) => void;
  initialIndex?: number;
}
