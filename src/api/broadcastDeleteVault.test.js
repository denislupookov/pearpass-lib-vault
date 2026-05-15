jest.mock('./broadcastAction', () => ({
  broadcastAction: jest.fn()
}))

jest.mock('../actions', () => ({
  ACTION_TYPES: { DELETE_VAULT: 'delete-vault' }
}))

import { broadcastAction } from './broadcastAction'
import { broadcastDeleteVault } from './broadcastDeleteVault'

describe('broadcastDeleteVault', () => {
  beforeEach(() => {
    broadcastAction.mockReset()
    broadcastAction.mockResolvedValue({ results: [], failures: [] })
  })

  it('throws synchronously when vaultId is missing', () => {
    expect(() => broadcastDeleteVault()).toThrow(
      'broadcastDeleteVault: vaultId is required'
    )
    expect(broadcastAction).not.toHaveBeenCalled()
  })

  it('delegates to broadcastAction with the delete-vault type and vaultId payload', async () => {
    await broadcastDeleteVault('v1')

    expect(broadcastAction).toHaveBeenCalledWith({
      type: 'delete-vault',
      payload: { vaultId: 'v1' }
    })
  })

  it('forwards broadcastAction result to the caller', async () => {
    broadcastAction.mockResolvedValue({
      results: [{ targetDeviceId: 'peer-A', channel: 'outbox' }],
      failures: []
    })
    const result = await broadcastDeleteVault('v1')
    expect(result.results).toHaveLength(1)
  })
})
