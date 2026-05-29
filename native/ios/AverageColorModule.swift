import Foundation
import CoreImage

/**
 Módulo nativo iOS que extrae el color promedio de una imagen usando CIAreaAverage.
 Registrar en AverageColorModule.m con RCT_EXTERN_MODULE y RCT_EXTERN_METHOD.
 */
@objc(AverageColor)
class AverageColorModule: NSObject {

  @objc func getAverageColor(
    _ uri: String,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    guard let url = URL(string: uri),
          let ciImage = CIImage(contentsOf: url) else {
      reject("DECODE_ERROR", "No se pudo cargar la imagen: \(uri)", nil)
      return
    }

    let filter = CIFilter(name: "CIAreaAverage")!
    filter.setValue(ciImage, forKey: kCIInputImageKey)
    filter.setValue(CIVector(cgRect: ciImage.extent), forKey: "inputExtent")

    guard let outputImage = filter.outputImage else {
      reject("FILTER_ERROR", "No se pudo aplicar el filtro", nil)
      return
    }

    let context = CIContext()
    var bitmap = [UInt8](repeating: 0, count: 4)
    context.render(
      outputImage,
      toBitmap: &bitmap,
      rowBytes: 4,
      bounds: CGRect(x: 0, y: 0, width: 1, height: 1),
      format: .RGBA8,
      colorSpace: CGColorSpaceCreateDeviceRGB()
    )

    let hex = String(format: "#%02X%02X%02X", bitmap[0], bitmap[1], bitmap[2])
    resolve(hex)
  }

  @objc static func requiresMainQueueSetup() -> Bool {
    return false
  }
}
