'use no memo';

import { Voltra } from 'voltra';
import { type WidgetData, widgetColors } from './widget-utils';

interface PrayerWidgetProps {
  data: WidgetData;
  colorScheme?: 'light' | 'dark';
}

// SF Symbol icons for each prayer
function getPrayerIcon(key: string): string {
  switch (key) {
    case 'fajr':
      return 'sunrise.fill';
    case 'sunrise':
      return 'sun.max';
    case 'dhuhr':
      return 'sun.max.fill';
    case 'asr':
      return 'sun.min.fill';
    case 'maghrib':
      return 'sunset.fill';
    case 'isha':
      return 'moon.stars.fill';
    default:
      return 'clock';
  }
}

/**
 * Small widget - Shows next prayer with countdown
 */
export function SmallPrayerWidget({ data, colorScheme = 'dark' }: PrayerWidgetProps) {
  const colors = widgetColors[colorScheme];

  if (!data.hasLocation) {
    return (
      <Voltra.VStack
        alignment="center"
        style={{
          flex: 1,
          backgroundColor: colors.background,
          padding: 16,
        }}
      >
        <Voltra.Symbol
          name="location.slash"
          size={28}
          tintColor={colors.textMuted}
          style={{ marginBottom: 8 }}
        />
        <Voltra.Text
          style={{
            fontSize: 13,
            fontWeight: '500',
            color: colors.textSecondary,
          }}
        >
          Open Ibadah to enable location
        </Voltra.Text>
      </Voltra.VStack>
    );
  }

  const { nextPrayer } = data;

  return (
    <Voltra.VStack
      alignment="center"
      style={{
        flex: 1,
        backgroundColor: colors.background,
        padding: 6,
      }}
    >
      <Voltra.HStack alignment="center" spacing={8}>
        <Voltra.Symbol
          name={getPrayerIcon(nextPrayer?.key || 'fajr')}
          size={20}
          tintColor={colors.accent}
        />
        <Voltra.Text
          style={{
            fontSize: 24,
            fontWeight: '700',
            color: colors.accent,
          }}
        >
          {nextPrayer?.name || 'Fajr'}
        </Voltra.Text>
      </Voltra.HStack>

      <Voltra.Spacer style={{ height: 4 }} />

      <Voltra.Text
        style={{
          fontSize: 15,
          fontWeight: '500',
          color: colors.text,
          marginTop: 4,
          marginBottom: 4,
        }}
      >
        {nextPrayer?.time || '--:--'}
      </Voltra.Text>

      {nextPrayer?.timeMs && (
        <Voltra.Timer
          endAtMs={nextPrayer.timeMs}
          direction="down"
          textStyle="relative"
          showHours={true}
          style={{
            fontSize: 20,
            fontWeight: '600',
            color: colors.textSecondary,
          }}
        />
      )}
    </Voltra.VStack>
  );
}

/**
 * Medium widget - Shows next prayer with countdown + upcoming prayers
 */
export function MediumPrayerWidget({ data, colorScheme = 'dark' }: PrayerWidgetProps) {
  const colors = widgetColors[colorScheme];

  if (!data.hasLocation) {
    return (
      <Voltra.HStack
        alignment="center"
        style={{
          flex: 1,
          backgroundColor: colors.background,
          padding: 16,
        }}
      >
        <Voltra.Symbol
          name="location.slash"
          size={28}
          tintColor={colors.textMuted}
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
            Location Required
          </Voltra.Text>
          <Voltra.Text
            style={{
              fontSize: 13,
              color: colors.textSecondary,
            }}
          >
            Open Ibadah to enable location
          </Voltra.Text>
        </Voltra.VStack>
      </Voltra.HStack>
    );
  }

  const { nextPrayer, upcomingPrayers } = data;

  return (
    <Voltra.HStack
      spacing={0}
      style={{
        flex: 1,
        backgroundColor: colors.background,
      }}
    >
      {/* Left section - Next prayer */}
      <Voltra.VStack
        alignment="center"
        style={{
          flex: 1,
          padding: 6,
          backgroundColor: colors.backgroundSecondary,
          borderRadius: 32,
          margin: 8,
          marginRight: 4,
        }}
      >
        <Voltra.HStack alignment="center" spacing={6}>
          <Voltra.Symbol
            name={getPrayerIcon(nextPrayer?.key || 'fajr')}
            size={20}
            tintColor={colors.accent}
          />
          <Voltra.Text
            style={{
              fontSize: 24,
              fontWeight: '700',
              color: colors.accent,
            }}
          >
            {nextPrayer?.name || 'Fajr'}
          </Voltra.Text>
        </Voltra.HStack>

        <Voltra.Spacer style={{ height: 4 }} />

        <Voltra.Text
          style={{
            fontSize: 14,
            fontWeight: '500',
            color: colors.text,
            marginTop: 4,
            marginBottom: 4,
          }}
        >
          {nextPrayer?.time || '--:--'}
        </Voltra.Text>

        {nextPrayer?.timeMs && (
          <Voltra.Timer
            endAtMs={nextPrayer.timeMs}
            direction="down"
            textStyle="relative"
            showHours={true}
            style={{
              fontSize: 16,
              fontWeight: '600',
              color: colors.textSecondary,
            }}
          />
        )}
      </Voltra.VStack>

      {/* Right section - Upcoming prayers */}
      <Voltra.VStack
        alignment="center"
        spacing={12}
        style={{
          flex: 1,
          padding: 12,
          paddingLeft: 8,
        }}
      >
        <Voltra.Text
          style={{
            fontSize: 14,
            fontWeight: '600',
            color: colors.textMuted,
            letterSpacing: 1,
          }}
        >
          UPCOMING
        </Voltra.Text>

        <Voltra.Spacer style={{ height: 2 }} />


        {upcomingPrayers.map((prayer) => (
          <Voltra.HStack spacing={12} key={prayer.key} alignment="center">
            <Voltra.Text
              style={{
                fontSize: 15,
                fontWeight: '500',
                color: colors.text,
                // flex: 1,
              }}
            >
              {prayer.name}
            </Voltra.Text>
            <Voltra.Text
              style={{
                fontSize: 15,
                fontWeight: '500',
                color: colors.textSecondary,
              }}
            >
              {prayer.time}
            </Voltra.Text>
          </Voltra.HStack>
        ))}
      </Voltra.VStack>
    </Voltra.HStack>
  );
}

/**
 * Large widget - Shows all prayer times for the day
 */
export function LargePrayerWidget({ data, colorScheme = 'dark' }: PrayerWidgetProps) {
  const colors = widgetColors[colorScheme];

  if (!data.hasLocation) {
    return (
      <Voltra.VStack
        alignment="center"
        style={{
          flex: 1,
          backgroundColor: colors.background,
          padding: 24,
        }}
      >
        <Voltra.Symbol
          name="location.slash"
          size={40}
          tintColor={colors.textMuted}
          style={{ marginBottom: 12 }}
        />
        <Voltra.Text
          style={{
            fontSize: 17,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 4,
          }}
        >
          Location Required
        </Voltra.Text>
        <Voltra.Text
        numberOfLines={2}
        multilineTextAlignment='center'
          style={{
            fontSize: 14,
            color: colors.textSecondary,
          }}
        >
          Please grant location permission for prayer times
        </Voltra.Text>
      </Voltra.VStack>
    );
  }

  const { nextPrayer, allPrayers, currentDate, islamicDate } = data;

  return (
    <Voltra.VStack
      spacing={0}
      style={{
        flex: 1,
        backgroundColor: colors.background,
        padding: 16,
      }}
    >
      {/* Header */}
      <Voltra.HStack alignment="center" style={{ marginBottom: 12 }}>
        <Voltra.VStack alignment="leading" spacing={2}>
          <Voltra.Text
            style={{
              fontSize: 15,
              fontWeight: '600',
              color: colors.text,
            }}
          >
            {currentDate}
          </Voltra.Text>
          <Voltra.Text
            style={{
              fontSize: 12,
              color: colors.textMuted,
            }}
          >
            {islamicDate}
          </Voltra.Text>
        </Voltra.VStack>

        <Voltra.Spacer />

        {nextPrayer?.timeMs && (
          <Voltra.VStack alignment="trailing" spacing={2}>
            <Voltra.Text
              style={{
                fontSize: 11,
                fontWeight: '500',
                color: colors.textMuted,
              }}
            >
              Next in
            </Voltra.Text>
            <Voltra.Timer
              endAtMs={nextPrayer.timeMs}
              direction="down"
              textStyle="relative"
              showHours={true}
              style={{
                fontSize: 14,
                fontWeight: '600',
                color: colors.accent,
              }}
            />
          </Voltra.VStack>
        )}
      </Voltra.HStack>

      <Voltra.Divider style={{ backgroundColor: colors.divider, marginBottom: 8 }} />

      {/* Prayer times grid */}
      <Voltra.VStack spacing={6} style={{ flex: 1 }}>
        {allPrayers.map((prayer) => {
          const isNext = nextPrayer?.key === prayer.key;
          return (
            <Voltra.HStack
              key={prayer.key}
              alignment="center"
              spacing={8}
              style={{
                padding: 8,
                paddingHorizontal: 12,
                backgroundColor: 'transparent',
                borderRadius: 10,
                borderWidth: isNext ? 0.5 : 0,
                borderColor: isNext ? colors.accent : 'transparent',
              }}
            >
              <Voltra.Spacer />
              <Voltra.Symbol
                name={getPrayerIcon(prayer.key)}
                size={20}
                tintColor={isNext ? colors.accent : colors.textMuted}
              />
              <Voltra.Spacer />
              <Voltra.Text
                style={{
                  fontSize: 15,
                  fontWeight: isNext ? '700' : '500',
                  color: isNext ? colors.accent : colors.text,
                  flex: 1,
                }}
              >
                {prayer.name}
              </Voltra.Text>

              <Voltra.Text
                style={{
                  fontSize: 15,
                  fontWeight: isNext ? '700' : '500',
                  color: isNext ? colors.accent : colors.textSecondary,
                }}
              >
                {prayer.time}
              </Voltra.Text>
              <Voltra.Spacer />
            </Voltra.HStack>
          );
        })}
      </Voltra.VStack>
    </Voltra.VStack>
  );
}

/**
 * Render widget content based on family size
 */
export function renderPrayerWidget(
  family: 'systemSmall' | 'systemMedium' | 'systemLarge',
  data: WidgetData,
  colorScheme: 'light' | 'dark' = 'dark'
) {
  switch (family) {
    case 'systemSmall':
      return <SmallPrayerWidget data={data} colorScheme={colorScheme} />;
    case 'systemMedium':
      return <MediumPrayerWidget data={data} colorScheme={colorScheme} />;
    case 'systemLarge':
      return <LargePrayerWidget data={data} colorScheme={colorScheme} />;
  }
}
