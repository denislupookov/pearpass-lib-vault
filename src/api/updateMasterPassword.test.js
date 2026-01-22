import { updateMasterPassword } from './updateMasterPassword'
import { pearpassVaultClient } from '../instances'

jest.mock('../instances', () => ({
  pearpassVaultClient: {
    updateMasterPassword: jest.fn()
  }
}))

describe('updateMasterPassword', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('delegates to pearpassVaultClient and returns updated payload', async () => {
    pearpassVaultClient.updateMasterPassword.mockResolvedValue({
      hashedPassword: 'hashedPassword',
      salt: 'salt',
      ciphertext: 'ciphertext',
      nonce: 'nonce'
    })

    const result = await updateMasterPassword({
      newPassword: 'newPassword',
      currentPassword: 'currentPassword'
    })

    expect(result).toEqual({
      hashedPassword: 'hashedPassword',
      salt: 'salt',
      ciphertext: 'ciphertext',
      nonce: 'nonce'
    })
    expect(pearpassVaultClient.updateMasterPassword).toHaveBeenCalledWith({
      newPassword: 'newPassword',
      currentPassword: 'currentPassword'
    })
  })
})
