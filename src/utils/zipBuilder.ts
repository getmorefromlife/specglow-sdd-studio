/**
 * Zero-dependency pure client-side ZIP generator (PKZIP 2.0 uncompressed store format)
 * Generates valid .zip files directly in browser Uint8Array memory.
 */

// CRC32 Lookup Table
const CRC_TABLE = new Uint32Array(256)
for (let i = 0; i < 256; i++) {
  let c = i
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  }
  CRC_TABLE[i] = c >>> 0
}

function calculateCrc32(data: Uint8Array): number {
  let crc = 0xffffffff
  for (let i = 0; i < data.length; i++) {
    crc = CRC_TABLE[(crc ^ data[i]) & 0xff] ^ (crc >>> 8)
  }
  return (crc ^ 0xffffffff) >>> 0
}

export interface ZipFileInput {
  filename: string
  content: string | Uint8Array
}

export function createZipArchive(files: ZipFileInput[]): Blob {
  const encoder = new TextEncoder()
  const localFileHeaders: Uint8Array[] = []
  const centralDirectoryHeaders: Uint8Array[] = []

  let currentOffset = 0

  for (const file of files) {
    const filenameBytes = encoder.encode(file.filename)
    const contentBytes = typeof file.content === 'string' ? encoder.encode(file.content) : file.content
    const crc = calculateCrc32(contentBytes)
    const size = contentBytes.length

    // DOS Time & Date (Fixed timestamp)
    const time = 0x5420 // 10:33 AM
    const date = 0x5d51 // Oct 17, 2026

    // --- Local File Header (30 bytes + filename + data) ---
    const localHeader = new Uint8Array(30 + filenameBytes.length + size)
    const lView = new DataView(localHeader.buffer)

    lView.setUint32(0, 0x04034b50, true) // Local header signature
    lView.setUint16(4, 20, true)         // Version needed to extract (2.0)
    lView.setUint16(6, 0x0800, true)     // General purpose bit flag (UTF-8)
    lView.setUint16(8, 0, true)          // Compression method (0 = Store)
    lView.setUint16(10, time, true)      // Last mod file time
    lView.setUint16(12, date, true)      // Last mod file date
    lView.setUint32(14, crc, true)       // CRC-32
    lView.setUint32(18, size, true)      // Compressed size
    lView.setUint32(22, size, true)      // Uncompressed size
    lView.setUint16(26, filenameBytes.length, true) // File name length
    lView.setUint16(28, 0, true)         // Extra field length

    localHeader.set(filenameBytes, 30)
    localHeader.set(contentBytes, 30 + filenameBytes.length)

    localFileHeaders.push(localHeader)

    // --- Central Directory Header (46 bytes + filename) ---
    const centralHeader = new Uint8Array(46 + filenameBytes.length)
    const cView = new DataView(centralHeader.buffer)

    cView.setUint32(0, 0x02014b50, true) // Central file header signature
    cView.setUint16(4, 20, true)         // Version made by
    cView.setUint16(6, 20, true)         // Version needed to extract
    cView.setUint16(8, 0x0800, true)     // General purpose bit flag (UTF-8)
    cView.setUint16(10, 0, true)         // Compression method
    cView.setUint16(12, time, true)      // Last mod file time
    cView.setUint16(14, date, true)      // Last mod file date
    cView.setUint32(16, crc, true)       // CRC-32
    cView.setUint32(20, size, true)      // Compressed size
    cView.setUint32(24, size, true)      // Uncompressed size
    cView.setUint16(28, filenameBytes.length, true) // File name length
    cView.setUint16(30, 0, true)         // Extra field length
    cView.setUint16(32, 0, true)         // File comment length
    cView.setUint16(34, 0, true)         // Disk number start
    cView.setUint16(36, 0, true)         // Internal file attributes
    cView.setUint32(38, 0, true)         // External file attributes
    cView.setUint32(42, currentOffset, true) // Relative offset of local header

    centralHeader.set(filenameBytes, 46)
    centralDirectoryHeaders.push(centralHeader)

    currentOffset += localHeader.length
  }

  // --- End of Central Directory Record (22 bytes) ---
  const centralDirSize = centralDirectoryHeaders.reduce((acc, h) => acc + h.length, 0)
  const eocd = new Uint8Array(22)
  const eView = new DataView(eocd.buffer)

  eView.setUint32(0, 0x06054b50, true) // EOCD signature
  eView.setUint16(4, 0, true)          // Number of this disk
  eView.setUint16(6, 0, true)          // Disk where central directory starts
  eView.setUint16(8, files.length, true)  // Number of central directory records on this disk
  eView.setUint16(10, files.length, true) // Total number of central directory records
  eView.setUint32(12, centralDirSize, true) // Size of central directory
  eView.setUint32(16, currentOffset, true) // Offset of start of central directory
  eView.setUint16(20, 0, true)         // Comment length

  // Combine into single Blob
  const allParts: (Uint8Array | Blob)[] = [...localFileHeaders, ...centralDirectoryHeaders, eocd]
  return new Blob(allParts as BlobPart[], { type: 'application/zip' })
}
