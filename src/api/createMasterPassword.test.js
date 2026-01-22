import { createMasterPassword } from './createMasterPassword'
import { pearpassVaultClient } from '../instances'
import { stringToBuffer } from '../utils/buffer'

jest.mock('../instances', () => ({
  pearpassVaultClient: {
    createMasterPassword: jest.fn()
  }
}))

describe('createMasterPassword', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('delegates creation to pearpassVaultClient', async () => {
    const mockEncryptionResult = {
      ciphertext: 'ciphertext',
      nonce: 'nonce',
      salt: 'salt',
      hashedPassword: 'hashedPassword'
    }
    pearpassVaultClient.createMasterPassword.mockResolvedValue(
      mockEncryptionResult
    )

    const passwordBuffer = stringToBuffer('testPassword')
    const res = await createMasterPassword(passwordBuffer)

    expect(pearpassVaultClient.createMasterPassword).toHaveBeenCalledWith(
      passwordBuffer
    )
    expect(res).toEqual(mockEncryptionResult)
  })
})
