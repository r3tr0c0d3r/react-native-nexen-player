#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(NexenPlayerModule, NSObject)
RCT_EXTERN_METHOD(setBrightness:(nonnull NSNumber *) brightness)
RCT_EXTERN_METHOD(showSystemBar)
RCT_EXTERN_METHOD(hideSystemBar)
@end
