#import <React/RCTBridgeModule.h>

RCT_EXTERN_MODULE(AverageColor, NSObject)

RCT_EXTERN_METHOD(
  getAverageColor:(NSString *)uri
  resolve:(RCTPromiseResolveBlock)resolve
  reject:(RCTPromiseRejectBlock)reject
)
