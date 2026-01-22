import { pearpassVaultClient } from '../instances'

/**
 * @param {{
 *   password: Uint8Array
 * }} params
 * @returns {Promise<boolean>}
 */
export const initWithPassword = async (params) => {
  if (!params.password) {
    throw new Error('Password is required')
  }

  await pearpassVaultClient.initWithPassword(params.password)
  return true
}
