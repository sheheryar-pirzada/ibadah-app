import ExpoModulesCore
import ARKit

public class ARQiblaModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ARQiblaModule")

    // Check if ARKit is supported on device
    Function("isSupported") { () -> Bool in
      return ARWorldTrackingConfiguration.isSupported
    }

    // Native AR View registration
    View(ARQiblaView.self) {
      Prop("qiblaBearing") { (view, bearing: Double) in
        view.qiblaBearing = bearing
      }

      Prop("isActive") { (view, active: Bool) in
        if active {
          view.startSession()
        } else {
          view.stopSession()
        }
      }

      Events("onTrackingStateChange")
    }
  }
}
