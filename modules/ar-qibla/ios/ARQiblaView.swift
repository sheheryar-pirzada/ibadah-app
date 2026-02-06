import ExpoModulesCore
import ARKit
import RealityKit
import UIKit

public class ARQiblaView: ExpoView, ARSessionDelegate {
  private var arView: ARView!
  private var kaabahAnchor: AnchorEntity?
  private var kaabahEntity: ModelEntity?
  private var arrowEntity: ModelEntity?
  private var arrowBobEntity: ModelEntity?
  private var isSessionRunning = false
  private var hasPlacedOnPlane = false
  /// When we're facing Qibla but no plane hit yet, timestamp we started waiting. Nil when not waiting.
  private var facingQiblaNoPlaneSince: TimeInterval?

  /// Cube size (edge length in meters). Bigger = more visible on the plane.
  private let cubeSize: Float = 0.6
  /// How long to keep trying for a plane (seconds) before floating.
  private let planeSearchDuration: TimeInterval = 2.0

  var qiblaBearing: Double = 0 {
    didSet {
      qiblaBearing = normalizeBearing(qiblaBearing)
      updateArrowOrientation()
    }
  }

  private var currentHeading: Double = 0

  let onTrackingStateChange = EventDispatcher()

  public required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)
    setupARView()
  }

  private func setupARView() {
    arView = ARView(frame: bounds)
    arView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
    arView.session.delegate = self
    addSubview(arView)

    // Kaaba will be placed on the first horizontal plane hit by a center-screen raycast.
  }

  private func placeKaabah(at worldPosition: SIMD3<Float>) {
    guard !hasPlacedOnPlane else { return }
    hasPlacedOnPlane = true

    let anchorEntity = AnchorEntity(world: worldPosition)
    let entity = createKaabahEntity()

    // Lift entity so the bottom of the cube sits on the plane (half height up)
    entity.position = SIMD3<Float>(0, cubeSize / 2, 0)

    kaabahAnchor = anchorEntity
    kaabahEntity = entity
    anchorEntity.addChild(entity)
    arView.scene.addAnchor(anchorEntity)
  }

  private func createKaabahEntity() -> ModelEntity {
    // Black cube mesh (Kaabah dimensions ratio: roughly cubic) — larger size
    let mesh = MeshResource.generateBox(size: cubeSize, cornerRadius: 0.02)

    // Black material with slight roughness
    var blackMaterial = SimpleMaterial()
    blackMaterial.color = .init(tint: UIColor(red: 0.05, green: 0.05, blue: 0.05, alpha: 1.0))
    blackMaterial.roughness = 0.8
    blackMaterial.metallic = 0.1

    let entity = ModelEntity(mesh: mesh, materials: [blackMaterial])

    // Add gold trim as child entities
    addGoldTrim(to: entity)
    addDirectionArrow(to: entity)

    return entity
  }

  private func addGoldTrim(to parent: ModelEntity) {
    // Gold band around the top third (scaled with cubeSize)
    let bandW = cubeSize + 0.04
    let bandH: Float = 0.04
    let bandMesh = MeshResource.generateBox(width: bandW, height: bandH, depth: bandW, cornerRadius: 0.01)
    var goldMaterial = SimpleMaterial()
    goldMaterial.color = .init(tint: UIColor(red: 0.83, green: 0.68, blue: 0.21, alpha: 1.0))
    goldMaterial.metallic = 0.9
    goldMaterial.roughness = 0.3

    let goldBand = ModelEntity(mesh: bandMesh, materials: [goldMaterial])
    goldBand.position = SIMD3<Float>(0, cubeSize * 0.28, 0) // Upper portion
    parent.addChild(goldBand)

    // Black stone marker (corner indicator)
    let stoneRadius: Float = 0.04
    let stoneMesh = MeshResource.generateSphere(radius: stoneRadius)
    var stoneMaterial = SimpleMaterial()
    stoneMaterial.color = .init(tint: UIColor(red: 0.15, green: 0.1, blue: 0.08, alpha: 1.0))
    stoneMaterial.metallic = 0.6
    stoneMaterial.roughness = 0.4

    let blackStone = ModelEntity(mesh: stoneMesh, materials: [stoneMaterial])
    blackStone.position = SIMD3<Float>(cubeSize * 0.5, -cubeSize * 0.18, cubeSize * 0.5)
    parent.addChild(blackStone)
  }

  private func addDirectionArrow(to parent: ModelEntity) {
    // A simple golden chevron placed above the cube, pointing toward Qibla
    var goldMaterial = SimpleMaterial()
    goldMaterial.color = .init(tint: UIColor(red: 0.83, green: 0.68, blue: 0.21, alpha: 1.0))
    goldMaterial.metallic = 0.9
    goldMaterial.roughness = 0.3

    let arrowPivot = ModelEntity()
    let arrowBob = ModelEntity()

    // Chevron shape (two angled arms meeting at a point, "V" pointing forward)
    let armLength: Float = cubeSize * 0.6
    let armWidth: Float = cubeSize * 0.028
    let armHeight: Float = cubeSize * 0.04
    let armMesh = MeshResource.generateBox(
      width: armWidth,
      height: armHeight,
      depth: armLength,
      cornerRadius: armWidth * 0.2
    )
    let armLeft = ModelEntity(mesh: armMesh, materials: [goldMaterial])
    let armRight = ModelEntity(mesh: armMesh, materials: [goldMaterial])
    let chevronAngle: Float = .pi / 6
    let halfLen = armLength * 0.5
    // Position so the back of each arm (local -Z) is at origin; center is halfLen along arm axis
    armLeft.position = SIMD3<Float>(sin(chevronAngle) * halfLen, 0, cos(chevronAngle) * halfLen)
    armRight.position = SIMD3<Float>(-sin(chevronAngle) * halfLen, 0, cos(chevronAngle) * halfLen)
    armLeft.orientation = simd_quatf(angle: chevronAngle, axis: SIMD3<Float>(0, 1, 0))
    armRight.orientation = simd_quatf(angle: -chevronAngle, axis: SIMD3<Float>(0, 1, 0))
    arrowBob.addChild(armLeft)
    arrowBob.addChild(armRight)

    arrowPivot.addChild(arrowBob)

    // Position the arrow above the cube
    arrowPivot.position = SIMD3<Float>(0, cubeSize * 0.7, 0)
    parent.addChild(arrowPivot)
    arrowEntity = arrowPivot
    arrowBobEntity = arrowBob
    updateArrowOrientation()
  }

  func startSession() {
    guard !isSessionRunning else { return }

    hasPlacedOnPlane = false
    facingQiblaNoPlaneSince = nil
    kaabahAnchor = nil
    kaabahEntity = nil

    let configuration = ARWorldTrackingConfiguration()
    configuration.worldAlignment = .gravityAndHeading // Uses compass for heading
    configuration.planeDetection = [.horizontal] // Detect ground/floor to place cube on

    arView.session.run(configuration, options: [.resetTracking, .removeExistingAnchors])
    isSessionRunning = true
  }

  func stopSession() {
    guard isSessionRunning else { return }
    arView.session.pause()
    isSessionRunning = false
  }

  public override func layoutSubviews() {
    super.layoutSubviews()
    arView.frame = bounds
  }

  // MARK: - ARSessionDelegate

  public func session(_ session: ARSession, didUpdate frame: ARFrame) {
    // ARCamera.transform is camera → world. Camera looks down -Z in camera space,
    // so "camera forward in world" = -columns.2 of the transform.
    let transform = frame.camera.transform
    let forward = -SIMD3<Float>(transform.columns.2.x, transform.columns.2.y, transform.columns.2.z)
    let forwardXZ = SIMD2<Float>(forward.x, forward.z)
    let forwardLength = length(forwardXZ)
    if forwardLength < 0.001 {
      return
    }
    // With .gravityAndHeading, -Z is north. Compass: 0° = north, 90° = east.
    // atan2(x, -z) so that forward (0,0,-1) → heading 0°.
    var heading = atan2(Float(forward.x), -Float(forward.z)) * 180 / .pi
    if heading < 0 { heading += 360 }
    currentHeading = Double(heading)
    tryPlaceKaabah(frame: frame)
    updateArrowBobbing(timestamp: frame.timestamp)
  }

  public func session(_ session: ARSession, cameraDidChangeTrackingState camera: ARCamera) {
    let state: String
    switch camera.trackingState {
    case .notAvailable:
      state = "notAvailable"
    case .limited(let reason):
      switch reason {
      case .excessiveMotion:
        state = "excessiveMotion"
      case .insufficientFeatures:
        state = "insufficientFeatures"
      case .initializing:
        state = "initializing"
      case .relocalizing:
        state = "relocalizing"
      @unknown default:
        state = "unknown"
      }
    case .normal:
      state = "normal"
    }

    onTrackingStateChange(["state": state])
  }

  public func session(_ session: ARSession, didFailWithError error: Error) {
    onTrackingStateChange(["state": "notAvailable"])
  }

  // MARK: - Helpers

  private func tryPlaceKaabah(frame: ARFrame) {
    guard !hasPlacedOnPlane else { return }

    let delta = shortestAngleDelta(qiblaBearing, currentHeading)
    let headingThreshold: Double = 12
    guard abs(delta) <= headingThreshold else {
      facingQiblaNoPlaneSince = nil
      return
    }

    let screenPoint = CGPoint(x: bounds.midX, y: bounds.midY)
    let results = arView.raycast(from: screenPoint, allowing: .estimatedPlane, alignment: .horizontal)
    if let hit = results.first {
      facingQiblaNoPlaneSince = nil
      let t = hit.worldTransform
      let worldPosition = SIMD3<Float>(t.columns.3.x, t.columns.3.y, t.columns.3.z)
      placeKaabah(at: worldPosition)
      return
    }

    // No plane found: only float after we've been trying for planeSearchDuration
    let now = frame.timestamp
    if let since = facingQiblaNoPlaneSince {
      guard now - since >= planeSearchDuration else { return }
    } else {
      facingQiblaNoPlaneSince = now
      return
    }
    facingQiblaNoPlaneSince = nil

    // Float it in front of the user (same forward as heading)
    let transform = frame.camera.transform
    let forward = -SIMD3<Float>(transform.columns.2.x, transform.columns.2.y, transform.columns.2.z)
    let forwardXZ = SIMD2<Float>(forward.x, forward.z)
    let forwardLength = length(forwardXZ)
    if forwardLength < 0.001 {
      return
    }
    let normalizedForward = SIMD3<Float>(forward.x / forwardLength, 0, forward.z / forwardLength)
    let distance: Float = 0.7
    let cameraPosition = SIMD3<Float>(transform.columns.3.x, transform.columns.3.y, transform.columns.3.z)
    let worldPosition = cameraPosition + normalizedForward * distance
    placeKaabah(at: worldPosition)
  }

  private func updateArrowBobbing(timestamp: TimeInterval) {
    guard let arrowBobEntity else { return }
    let time = Float(timestamp)
    let amplitude: Float = cubeSize * 0.06
    let speed: Float = 2.8
    let zOffset = sin(time * speed) * amplitude
    arrowBobEntity.position = SIMD3<Float>(0, 0, zOffset)
  }

  private func updateArrowOrientation() {
    // World: -Z = north. Qibla direction = (sin(B), 0, -cos(B)). Chevron tip is at -Z, open at +Z.
    // We want the tip to point toward Qibla, so -Z → (sin(B), 0, -cos(B)) => angle = -B (radians).
    let bRad = Float(qiblaBearing * .pi / 180)
    let angleRad: Float = -bRad
    arrowEntity?.orientation = simd_quatf(angle: angleRad, axis: SIMD3<Float>(0, 1, 0))
  }

  private func normalizeBearing(_ bearing: Double) -> Double {
    var value = bearing.truncatingRemainder(dividingBy: 360)
    if value < 0 { value += 360 }
    return value
  }

  private func shortestAngleDelta(_ target: Double, _ current: Double) -> Double {
    var diff = target - current
    while diff > 180 { diff -= 360 }
    while diff < -180 { diff += 360 }
    return diff
  }
}
