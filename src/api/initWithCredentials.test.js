import { initWithCredentials } from './initWithCredentials'
import { pearpassVaultClient } from '../instances'

jest.mock('../instances', () => ({
  pearpassVaultClient: {
    initWithCredentials: jest.fn()
  }
}))

const validParams = {
  ciphertext: 'ciphertext123',
  nonce: 'nonce123',
  hashedPassword: 'hashedPassword123'
}

describe('initWithCredentials', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('delegates to pearpassVaultClient and returns true', async () => {
    pearpassVaultClient.initWithCredentials.mockResolvedValue({
      success: true
    })

    const result = await initWithCredentials(validParams)

    expect(result).toBe(true)
    expect(pearpassVaultClient.initWithCredentials).toHaveBeenCalledWith({
      ciphertext: validParams.ciphertext,
      nonce: validParams.nonce,
      hashedPassword: validParams.hashedPassword
    })
  })
})
