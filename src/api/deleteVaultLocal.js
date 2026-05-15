import { ACTION_TYPES } from '../actions'
import { pearpassVaultClient } from '../instances'
import { broadcastAction } from './broadcastAction'
import { listVaults } from './listVaults'
import { logger } from '../utils/logger'

/**
 * Removes a vault from this device. Before wiping locally, broadcasts a
 * leave-vault envelope so each paired device removes us from their
 * device list; offline peers receive the envelope from the outbox the
 * next time they come online.
 *
 * @param {string} vaultId
 * @returns {Promise<Array<any>>} the remaining vaults after deletion.
 */
export const deleteVaultLocal = async (vaultId) => {
  if (!vaultId) {
    throw new Error('vaultId is required')
  }

  try {
    await broadcastAction({
      type: ACTION_TYPES.LEAVE_VAULT,
      payload: { vaultId }
    })
  } catch (err) {
    logger.error('deleteVaultLocal: leave broadcast failed', { err })
  }

  await pearpassVaultClient.removeVault(vaultId)

  return listVaults()
}
