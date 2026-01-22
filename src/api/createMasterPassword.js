import { pearpassVaultClient } from '../instances'

/**
 * @param {Uint8Array} passwordBuffer
 * @returns {Promise<{
 *   ciphertext: string
 *   nonce: string
 *   salt: string
 *   hashedPassword: string
 * }>}
 */
export const createMasterPassword = async (passwordBuffer) => {
  const { hashedPassword, salt, ciphertext, nonce } =
    await pearpassVaultClient.createMasterPassword(passwordBuffer)

  return { hashedPassword, salt, ciphertext, nonce }
}
