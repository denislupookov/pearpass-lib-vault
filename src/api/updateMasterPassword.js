import { pearpassVaultClient } from '../instances'

/**
 * @param {{newPassword: Uint8Array, currentPassword: Uint8Array}} params
 * @returns {Promise<{
 *   hashedPassword: string
 *   salt: string
 *   ciphertext: string
 *   nonce: string
 * }>}
 */
export const updateMasterPassword = async ({
  newPassword,
  currentPassword
}) => {
  const { hashedPassword, salt, ciphertext, nonce } =
    await pearpassVaultClient.updateMasterPassword({
      newPassword,
      currentPassword
    })

  return { hashedPassword, salt, ciphertext, nonce }
}
