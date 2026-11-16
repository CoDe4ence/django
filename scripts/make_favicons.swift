// Renders the site's favicons and app icons from the two SVGs in static/images/logo/favicon/:
//   favicon.svg        the navbar logo with its frame filled in brand violet (32px and up)
//   favicon-small.svg  the same, retouched for 16px (thicker frame, bolder k)
// Run from the repository root:  swift scripts/make_favicons.swift
// Uses macOS's own SVG renderer (NSImage), so it needs no extra tools.

import AppKit

let dir = URL(fileURLWithPath: "static/images/logo/favicon")
let violet = NSColor(srgbRed: 0x7c / 255.0, green: 0x3a / 255.0, blue: 0xed / 255.0, alpha: 1)

func load(_ name: String) -> NSImage {
    guard let image = NSImage(contentsOf: dir.appendingPathComponent(name)) else {
        fatalError("cannot read \(name)")
    }
    return image
}

// size: pixels; background: fills the whole square (opaque icons); scale: logo size relative to the square
func render(_ image: NSImage, size: Int, background: NSColor? = nil, scale: CGFloat = 1) -> Data {
    let rep = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: size, pixelsHigh: size, bitsPerSample: 8,
                               samplesPerPixel: 4, hasAlpha: true, isPlanar: false,
                               colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0)!
    rep.size = NSSize(width: size, height: size)
    NSGraphicsContext.saveGraphicsState()
    let context = NSGraphicsContext(bitmapImageRep: rep)!
    context.imageInterpolation = .high
    NSGraphicsContext.current = context
    let full = NSRect(x: 0, y: 0, width: size, height: size)
    if let background {
        background.setFill()
        full.fill()
    }
    let side = (CGFloat(size) * scale).rounded()
    let offset = (CGFloat(size) - side) / 2
    image.draw(in: NSRect(x: offset, y: offset, width: side, height: side), from: .zero, operation: .sourceOver, fraction: 1)
    NSGraphicsContext.restoreGraphicsState()
    return rep.representation(using: .png, properties: [:])!
}

func write(_ data: Data, _ name: String) {
    try! data.write(to: dir.appendingPathComponent(name))
    print("\(name)  \(data.count) bytes")
}

// a .ico holding PNG images (supported by every current browser and Windows since Vista)
func ico(_ images: [(size: Int, png: Data)]) -> Data {
    var out = Data()
    func u16(_ v: Int) { var x = UInt16(v).littleEndian; out.append(Data(bytes: &x, count: 2)) }
    func u32(_ v: Int) { var x = UInt32(v).littleEndian; out.append(Data(bytes: &x, count: 4)) }
    u16(0); u16(1); u16(images.count)
    var offset = 6 + 16 * images.count
    for image in images {
        out.append(UInt8(image.size >= 256 ? 0 : image.size))
        out.append(UInt8(image.size >= 256 ? 0 : image.size))
        out.append(0); out.append(0)
        u16(1); u16(32)
        u32(image.png.count); u32(offset)
        offset += image.png.count
    }
    for image in images { out.append(image.png) }
    return out
}

let main = load("favicon.svg")
let small = load("favicon-small.svg")

let png16 = render(small, size: 16)
let png32 = render(main, size: 32)
let png48 = render(main, size: 48)
write(png16, "favicon-16x16.png")
write(png32, "favicon-32x32.png")
write(ico([(16, png16), (32, png32), (48, png48)]), "favicon.ico")
// iOS wants an opaque square and rounds the corners itself
write(render(main, size: 180, background: violet, scale: 0.72), "apple-touch-icon.png")
// web manifest: transparent icons, and a maskable one whose logo sits inside the 80% safe circle
write(render(main, size: 192), "icon-192.png")
write(render(main, size: 512), "icon-512.png")
write(render(main, size: 512, background: violet, scale: 0.56), "icon-maskable-512.png")
