import { ACTION_TYPES } from '../actions'
import { pearpassVaultClient } from '../instances'
import { broadcastAction } from './broadcastAction'
import { deleteVaultLocal } from './deleteVaultLocal'
import { listVaults } from './listVaults'

jest.mock('./listVaults', () => ({
  listVaults: jest.fn()
}))

jest.mock('./broadcastAction', () => ({
  broadcastAction: jest.fn().mockResolvedValue({ results: [], failures: [] })
}))

describe('deleteVaultLocal', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('throws when vaultId is missing', async () => {
    await expect(deleteVaultLocal()).rejects.toThrow('vaultId is required')
    expect(pearpassVaultClient.removeVault).not.toHaveBeenCalled()
    expect(broadcastAction).not.toHaveBeenCalled()
  })

  it('broadcasts leave-vault before removing locally', async () => {
    const remaining = [{ id: 'v2' }]
    listVaults.mockResolvedValueOnce(remaining)

    const result = await deleteVaultLocal('v1')

    expect(broadcastAction).toHaveBeenCalledWith({
      type: ACTION_TYPES.LEAVE_VAULT,
      payload: { vaultId: 'v1' }
    })
    expect(pearpassVaultClient.removeVault).toHaveBeenCalledWith('v1')
    expect(listVaults).toHaveBeenCalledTimes(1)
    expect(result).toBe(remaining)

    expect(broadcastAction.mock.invocationCallOrder[0]).toBeLessThan(
      pearpassVaultClient.removeVault.mock.invocationCallOrder[0]
    )
  })

  it('still removes locally when broadcastAction fails', async () => {
    broadcastAction.mockRejectedValueOnce(new Error('broadcast boom'))
    const remaining = []
    listVaults.mockResolvedValueOnce(remaining)

    const result = await deleteVaultLocal('v1')

    expect(pearpassVaultClient.removeVault).toHaveBeenCalledWith('v1')
    expect(result).toBe(remaining)
  })

  it('does not call listVaults if removeVault fails', async () => {
    pearpassVaultClient.removeVault.mockRejectedValueOnce(new Error('boom'))

    await expect(deleteVaultLocal('v1')).rejects.toThrow('boom')
    expect(listVaults).not.toHaveBeenCalled()
  })
})
