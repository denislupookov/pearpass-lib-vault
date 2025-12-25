/**
 * Generic buffer utilities for string/buffer conversions and secure clearing
 * Uses sodium-native for cryptographically secure memory operations with
 * protected memory allocation
 */

import sodium from 'sodium-native'

/**
 * Convert string to UTF-8 encoded buffer in secure memory
 * @param {string} str
 * @returns {Buffer}
 */
export const stringToBuffer = (str) => {
  if (typeof str !== 'string') {
    throw new TypeError('Input must be a string')
  }

  // Use Buffer.from for UTF-8 encoding, then copy to secure memory
  const tempBuffer = Buffer.from(str, 'utf8')

  // Allocate secure buffer and copy data into it
  const secureBuffer = sodium.sodium_malloc(tempBuffer.length)
  tempBuffer.copy(secureBuffer)

  // Clear the temporary buffer
  tempBuffer.fill(0)

  return secureBuffer
}

/**
 * Convert Buffer to UTF-8 string
 * @param {Buffer} buffer
 * @returns {string}
 */
export const bufferToString = (buffer) => buffer.toString('utf8')

/**
 * Clear buffer by overwriting with zeros using sodium_memzero
 * This is resistant to compiler optimizations that might skip zeroing
 * Frees secure buffers allocated with sodium_malloc
 *
 * Only meant to be used with sodium-allocated buffers
 *
 * @param {Buffer} buffer - Must be a sodium-allocated buffer
 * @throws {TypeError} If buffer is not a valid Buffer
 */
export const clearBuffer = (buffer) => {
  if (
    !buffer ||
    typeof buffer !== 'object' ||
    typeof buffer.length !== 'number'
  ) {
    throw new TypeError('clearBuffer() requires a valid Buffer')
  }

  if (buffer.length === 0) {
    return // Empty buffer, nothing to clear
  }

  // Clear and free the secure buffer
  sodium.sodium_memzero(buffer)
  sodium.sodium_free(buffer)
}

/**
 * Execute callback with buffer, then clear it automatically
 * @template T
 * @param {Buffer} buffer
 * @param {(buffer: Buffer) => Promise<T>} callback
 * @returns {Promise<T>}
 */
export const withBuffer = async (buffer, callback) => {
  try {
    return await callback(buffer)
  } finally {
    clearBuffer(buffer)
  }
}

/**
 * Compare two buffers in constant time using sodium_memcmp
 * Resistant to timing attacks
 * @param {Buffer} a
 * @param {Buffer} b
 * @returns {boolean}
 */
export const compareBuffers = (a, b) => {
  const isBufferLike = (obj) =>
    obj && typeof obj === 'object' && typeof obj.length === 'number'

  if (!isBufferLike(a) || !isBufferLike(b)) {
    throw new TypeError('Both arguments must be Buffer')
  }

  if (a.length !== b.length) {
    return false
  }

  return sodium.sodium_memcmp(a, b)
}
