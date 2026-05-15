import { getCurrentVault } from '../api/getCurrentVault'
import { listDevices } from '../api/listDevices'
import { pearpassVaultClient } from '../instances'
import { ACTION_TYPES } from './types'

export { ACTION_TYPES }

/**
 * Built-in receive-side handlers. Each handler runs from processInbox
 * when a matching envelope is delivered via the personal swarm.
 *
 * delete-vault: another paired device removed our access. Emit
 * 'vault-access-revoked' so the app layer can run the local data wipe
 * via its existing useVault.deleteVaultLocal flow.
 *
 * leave-vault: another paired device is leaving this vault. Remove their
 * device record from the shared autobase so they disappear from our
 * paired-devices list. Throws (defers via processInbox retry) when the
 * target vault isn't currently active, since we can only write to the
 * active vault.
 */
export const ACTIONS = {
  [ACTION_TYPES.DELETE_VAULT]: {
    execute: async (action) => {
      const vaultId = action?.payload?.vaultId
      if (!vaultId) {
        throw new Error('delete-vault action: payload.vaultId is required')
      }
      if (pearpassVaultClient.listenerCount?.('vault-access-revoked') === 0) {
        throw new Error('delete-vault action: no vault-access-revoked listener')
      }
      pearpassVaultClient.emit('vault-access-revoked', {
        vaultId,
        actor: action?.actor
      })
    }
  },
  [ACTION_TYPES.LEAVE_VAULT]: {
    execute: async (action) => {
      const vaultId = action?.payload?.vaultId
      const actorId = action?.actor
      if (!vaultId || !actorId) {
        throw new Error('leave-vault action: vaultId and actor are required')
      }

      const currentVault = await getCurrentVault()
      if (currentVault?.id !== vaultId) {
        throw new Error('leave-vault: target vault not active, will retry')
      }

      const devices = (await listDevices()) ?? []
      const actorDevice = devices.find((d) => d?.id === actorId)
      if (!actorDevice) return

      await pearpassVaultClient.activeVaultRemove(`device/${actorId}`)
    }
  }
}
