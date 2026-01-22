import { pearpassVaultClient } from '../instances'

/**
 * @param {{
 *   ciphertext: string
 *   nonce: string
 *   hashedPassword: string
 * }} params
 * @returns {Promise<boolean>}
 */
export const initWithCredentials = async (params) => {
  await pearpassVaultClient.initWithCredentials({
    ciphertext: params.ciphertext,
    nonce: params.nonce,
    hashedPassword: params.hashedPassword
  })

  return true
}
