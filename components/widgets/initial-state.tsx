import { Voltra, type WidgetVariants } from 'voltra';

const colors = {
  background: '#0F3D2C',
  backgroundSecondary: '#134832',
  text: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  textMuted: 'rgba(255, 255, 255, 0.5)',
  accent: '#D4AF37',
};

const initialState: WidgetVariants = {
  systemSmall: (
    <Voltra.VStack
      alignment="center"
      style={{
        flex: 1,
        backgroundColor: colors.background,
        padding: 16,
      }}
    >
      <Voltra.Symbol
        name="moon.stars"
        size={28}
        tintColor={colors.accent}
        style={{ marginBottom: 8 }}
      />
      <Voltra.Text
        style={{
          fontSize: 13,
          fontWeight: '500',
          color: colors.textSecondary,
        }}
      >
        Open Ibadah to set up
      </Voltra.Text>
    </Voltra.VStack>
  ),
  systemMedium: (
    <Voltra.HStack
      alignment="center"
      style={{
        flex: 1,
        backgroundColor: colors.background,
        padding: 16,
      }}
    >
      <Voltra.Symbol
        name="moon.stars"
        size={32}
        tintColor={colors.accent}
        style={{ marginRight: 12 }}
      />
      <Voltra.VStack alignment="leading">
        <Voltra.Text
          style={{
            fontSize: 15,
            fontWeight: '600',
            color: colors.text,
          }}
        >
          Prayer Times
        </Voltra.Text>
        <Voltra.Text
          style={{
            fontSize: 13,
            color: colors.textSecondary,
          }}
        >
          Open Ibadah to set up
        </Voltra.Text>
      </Voltra.VStack>
    </Voltra.HStack>
  ),
  systemLarge: (
    <Voltra.VStack
      alignment="center"
      style={{
        flex: 1,
        backgroundColor: colors.background,
        padding: 24,
      }}
    >
      <Voltra.Symbol
        name="moon.stars"
        size={48}
        tintColor={colors.accent}
        style={{ marginBottom: 16 }}
      />
      <Voltra.Text
        style={{
          fontSize: 20,
          fontWeight: '600',
          color: colors.text,
          marginBottom: 8,
        }}
      >
        Prayer Times
      </Voltra.Text>
      <Voltra.Text
        style={{
          fontSize: 14,
          color: colors.textSecondary,
        }}
      >
        Open the Ibadah app to grant location permission and see prayer times
      </Voltra.Text>
    </Voltra.VStack>
  ),
};

export default initialState;
