import Foundation

@objc(NexenPlayerModule)
class NexenPlayerModule: NSObject {
    
    @objc
    static func requiresMainQueueSetup() -> Bool { return true }

    @objc
    func setBrightness(_ brightness: NSNumber) {
      // print("NexenPlayerModule: setBrightness: \(brightness)")
      DispatchQueue.main.async {
        let screen = UIScreen.main
        screen.brightness = CGFloat(brightness.floatValue)
      }
    }

    @objc
  func showSystemBar() {
    print("showSystemBar")
//     DispatchQueue.main.async {
//       let viewController = UIApplication.shared.keyWindow!.rootViewController as? RCTViewController

//       viewController?.shouldHideHomeIndicator = false
//             viewController?.setNeedsUpdateOfHomeIndicatorAutoHidden()
// //      viewController?.setNeedsUpdateOfScreenEdgesDeferringSystemGestures()
//     }
  }
  
  @objc
  func hideSystemBar() {
    print("hideSystemBar")
//     DispatchQueue.main.async {
//       let viewController = UIApplication.shared.keyWindow!.rootViewController as? RCTViewController
//       viewController?.shouldHideHomeIndicator = true
//             viewController?.setNeedsUpdateOfHomeIndicatorAutoHidden()
// //      viewController?.setNeedsUpdateOfScreenEdgesDeferringSystemGestures()
//     }
  }
}


