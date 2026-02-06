/**
 * @jest-environment node
 */

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

// Mock adhan library
jest.mock('adhan', () => ({
  CalculationMethod: {
    MuslimWorldLeague: () => ({}),
    Egyptian: () => ({}),
    Karachi: () => ({}),
    UmmAlQura: () => ({}),
    Dubai: () => ({}),
    MoonsightingCommittee: () => ({}),
    NorthAmerica: () => ({}),
    Kuwait: () => ({}),
    Qatar: () => ({}),
    Singapore: () => ({}),
    Tehran: () => ({}),
    Turkey: () => ({}),
    Other: () => ({}),
  },
  Madhab: {
    Shafi: 'shafi',
    Hanafi: 'hanafi',
  },
}));

import {
  getCalculationMethodOptions,
  getMadhabOptions,
  getPrayerSettings,
  savePrayerSettings,
  updateCalculationMethod,
  updateMadhab,
  resetPrayerSettings,
} from '@/utils/prayer-settings';
import AsyncStorage from '@react-native-async-storage/async-storage';

describe('prayer-settings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  });

  describe('getCalculationMethodOptions', () => {
    it('should return array of calculation method options', () => {
      const options = getCalculationMethodOptions();

      expect(Array.isArray(options)).toBe(true);
      expect(options.length).toBeGreaterThan(0);
    });

    it('should have key and name for each option', () => {
      const options = getCalculationMethodOptions();

      options.forEach(option => {
        expect(option).toHaveProperty('key');
        expect(option).toHaveProperty('name');
        expect(typeof option.key).toBe('string');
        expect(typeof option.name).toBe('string');
      });
    });

    it('should include common calculation methods', () => {
      const options = getCalculationMethodOptions();
      const keys = options.map(o => o.key);

      expect(keys).toContain('MuslimWorldLeague');
      expect(keys).toContain('Egyptian');
      expect(keys).toContain('Karachi');
      expect(keys).toContain('UmmAlQura');
      expect(keys).toContain('NorthAmerica');
    });

    it('should have unique keys', () => {
      const options = getCalculationMethodOptions();
      const keys = options.map(o => o.key);
      const uniqueKeys = new Set(keys);

      expect(uniqueKeys.size).toBe(keys.length);
    });

    it('should have non-empty names', () => {
      const options = getCalculationMethodOptions();

      options.forEach(option => {
        expect(option.name.length).toBeGreaterThan(0);
      });
    });

    it('should return all 13 standard methods', () => {
      const options = getCalculationMethodOptions();
      expect(options.length).toBe(13);
    });
  });

  describe('getMadhabOptions', () => {
    it('should return array of madhab options', () => {
      const options = getMadhabOptions();

      expect(Array.isArray(options)).toBe(true);
      expect(options.length).toBeGreaterThan(0);
    });

    it('should include Shafi and Hanafi', () => {
      const options = getMadhabOptions();
      const keys = options.map(o => o.key);

      expect(keys).toContain('Shafi');
      expect(keys).toContain('Hanafi');
    });

    it('should have exactly 2 options', () => {
      const options = getMadhabOptions();
      expect(options.length).toBe(2);
    });

    it('should have proper display names', () => {
      const options = getMadhabOptions();

      const shafiOption = options.find(o => o.key === 'Shafi');
      const hanafiOption = options.find(o => o.key === 'Hanafi');

      expect(shafiOption?.name).toBe("Shafi'i");
      expect(hanafiOption?.name).toBe('Hanafi');
    });
  });

  describe('getPrayerSettings', () => {
    it('should return default settings when no stored data', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const settings = await getPrayerSettings();

      expect(settings).toEqual({
        calculationMethod: 'MuslimWorldLeague',
        madhab: 'Shafi',
      });
    });

    it('should return stored settings when available', async () => {
      const storedSettings = {
        calculationMethod: 'Egyptian',
        madhab: 'Hanafi',
      };
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(storedSettings));

      const settings = await getPrayerSettings();

      expect(settings).toEqual(storedSettings);
    });

    it('should return defaults for invalid stored data', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('invalid json');

      const settings = await getPrayerSettings();

      expect(settings).toEqual({
        calculationMethod: 'MuslimWorldLeague',
        madhab: 'Shafi',
      });
    });

    it('should return defaults when stored settings have invalid keys', async () => {
      const invalidSettings = {
        calculationMethod: 'InvalidMethod',
        madhab: 'InvalidMadhab',
      };
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(invalidSettings));

      const settings = await getPrayerSettings();

      expect(settings).toEqual({
        calculationMethod: 'MuslimWorldLeague',
        madhab: 'Shafi',
      });
    });
  });

  describe('savePrayerSettings', () => {
    it('should save settings to AsyncStorage', async () => {
      const settings = {
        calculationMethod: 'Egyptian' as const,
        madhab: 'Hanafi' as const,
      };

      await savePrayerSettings(settings);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'prayer_settings',
        JSON.stringify(settings)
      );
    });

    it('should throw error when save fails', async () => {
      (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(new Error('Storage error'));

      const settings = {
        calculationMethod: 'Egyptian' as const,
        madhab: 'Hanafi' as const,
      };

      await expect(savePrayerSettings(settings)).rejects.toThrow('Storage error');
    });
  });

  describe('updateCalculationMethod', () => {
    it('should update only the calculation method', async () => {
      const existingSettings = {
        calculationMethod: 'MuslimWorldLeague',
        madhab: 'Shafi',
      };
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(existingSettings));
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      await updateCalculationMethod('Egyptian');

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'prayer_settings',
        JSON.stringify({
          calculationMethod: 'Egyptian',
          madhab: 'Shafi',
        })
      );
    });
  });

  describe('updateMadhab', () => {
    it('should update only the madhab', async () => {
      const existingSettings = {
        calculationMethod: 'MuslimWorldLeague',
        madhab: 'Shafi',
      };
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(existingSettings));
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      await updateMadhab('Hanafi');

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'prayer_settings',
        JSON.stringify({
          calculationMethod: 'MuslimWorldLeague',
          madhab: 'Hanafi',
        })
      );
    });
  });

  describe('resetPrayerSettings', () => {
    it('should reset to default settings', async () => {
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      await resetPrayerSettings();

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'prayer_settings',
        JSON.stringify({
          calculationMethod: 'MuslimWorldLeague',
          madhab: 'Shafi',
        })
      );
    });
  });
});
