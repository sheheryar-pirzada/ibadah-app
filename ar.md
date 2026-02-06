````md
# AR Qibla Direction with 3D Kaabah (Expo + iOS ARKit)

## Goal
Display a stable 3D Kaabah in AR that points toward the Qibla direction using iOS sensors, wrapped in a custom Expo plugin.

---

## Tech Stack
- Expo (Dev Client / EAS Build)
- iOS ARKit + RealityKit
- Core Location (GPS + heading)
- Core Motion (orientation)
- Swift native module
- React Native JS API

---

## High-Level Architecture

JS (React Native)
→ Expo Native Module
→ Core Location + ARKit
→ RealityKit ARView
→ 3D Kaabah Entity

Android: no-op or fallback compass view

---

## Phase 1. Project Setup

### 1. Expo Setup
- Use Expo Dev Client (Expo Go not supported)
- Run:
```bash
npx expo prebuild
````

### 2. Plugin Registration

* Create `plugins/withARKit.ts`
* Add:

  * Camera permission
  * Location permission
  * Motion permission

Register plugin in `app.config.ts`

---

## Phase 2. Permissions (iOS)

Required:

* `NSCameraUsageDescription`
* `NSLocationWhenInUseUsageDescription`

Recommended:

* `NSMotionUsageDescription`

---

## Phase 3. Qibla Calculation (Logic Layer)

### Fixed Coordinates

* Kaabah latitude: `21.4225`
* Kaabah longitude: `39.8262`

### Bearing Formula

* Input: user latitude, longitude
* Output: Qibla bearing in degrees (0–360)

This logic can live in:

* JS (simpler)
* or Swift (slightly more accurate)

---

## Phase 4. Native iOS Module

### 1. ARKit Module (Swift)

Responsibilities:

* Check ARKit support
* Start / stop AR session
* Provide device heading
* Expose orientation updates

Example API:

* `isSupported()`
* `startSession()`
* `stopSession()`

---

### 2. Core Location

* Use `CLLocationManager`
* Enable:

  * `startUpdatingLocation`
  * `startUpdatingHeading`
* Prefer `trueHeading`
* Fallback to `magneticHeading`

---

### 3. Core Motion

* Use `CMMotionManager`
* Track yaw / pitch / roll
* Improve stability when compass is noisy

---

## Phase 5. AR View (RealityKit)

### AR Configuration

* `ARWorldTrackingConfiguration`
* Horizontal plane detection optional
* No anchors needed for world placement

---

### 3D Kaabah Entity

* Load `.usdz` Kaabah model
* Place entity in front of camera
* Lock position
* Rotate only on Y-axis

Rotation logic:

```
rotation = qiblaBearing - deviceHeading
```

---

## Phase 6. JS Bridge API

### Native Module

```ts
ARKit.isSupported()
ARKit.start()
ARKit.stop()
ARKit.onHeadingUpdate(cb)
```

### Native View

```ts
<ARQiblaView qiblaBearing={bearing} />
```

Platform guard:

```ts
if (Platform.OS !== 'ios') return <FallbackCompass />
```

---

## Phase 7. Accuracy & UX Enhancements

* Figure-8 calibration prompt
* “Move phone slowly” hint
* Vibration when aligned
* On-screen numeric bearing
* Manual compass fallback mode

---

## Phase 8. Testing

* ❌ iOS Simulator not supported
* ✅ Real iPhone required
* Test:

  * Indoor vs outdoor
  * Metal interference
  * Different orientations
  * Device tilt handling

---

## Phase 9. Edge Cases

* No ARKit support → fallback view
* Location denied → manual city select
* Compass unavailable → motion-only mode

---

## Phase 10. Future Enhancements

* LiDAR-based depth (Pro models)
* Kaabah distance indicator
* Masjid-based Qibla presets
* Android ARCore implementation
* Open-source Expo plugin

---

## Final Notes

* Magnetometer is used indirectly only
* ARKit provides stabilization, not direction
* This approach matches production Qibla apps
* Expo is fully compatible via custom plugins
