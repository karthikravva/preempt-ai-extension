"""Generate PNG icons for the browser extension."""
import base64
import struct
import zlib


def create_png(size, color=(16, 163, 127)):
    """Create a simple solid color PNG icon."""

    def png_chunk(chunk_type, data):
        chunk_len = len(data)
        chunk = chunk_type + data
        crc = zlib.crc32(chunk) & 0xffffffff
        return struct.pack('>I', chunk_len) + chunk + struct.pack('>I', crc)

    # PNG signature
    signature = b'\x89PNG\r\n\x1a\n'

    # IHDR chunk
    ihdr_data = struct.pack('>IIBBBBB', size, size, 8, 2, 0, 0, 0)
    ihdr = png_chunk(b'IHDR', ihdr_data)

    # IDAT chunk (image data)
    raw_data = b''
    for y in range(size):
        raw_data += b'\x00'  # Filter byte
        for x in range(size):
            # Create circular gradient
            cx, cy = size / 2, size / 2
            dist = ((x - cx) ** 2 + (y - cy) ** 2) ** 0.5
            radius = size / 2 - 1

            if dist <= radius:
                # Inside circle - gradient from light to dark green
                factor = dist / radius
                r = int(color[0] * (1 - factor * 0.2))
                g = int(color[1] * (1 - factor * 0.2))
                b = int(color[2] * (1 - factor * 0.2))
                raw_data += bytes([r, g, b])
            else:
                # Outside circle - transparent (white for simplicity)
                raw_data += bytes([255, 255, 255])

    compressed = zlib.compress(raw_data, 9)
    idat = png_chunk(b'IDAT', compressed)

    # IEND chunk
    iend = png_chunk(b'IEND', b'')

    return signature + ihdr + idat + iend


# Generate icons
for size in [16, 48, 128]:
    png_data = create_png(size)
    with open(f'icons/icon{size}.png', 'wb') as f:
        f.write(png_data)
    print(f'Created icon{size}.png')

print('Done!')
