import { initWithPassword } from './initWithPassword'
import { pearpassVaultClient } from '../instances'
import { stringToBuffer } from '../utils/buffer'

jest.mock('../instances', () => ({
  pearpassVaultClient: {
    initWithPassword: jest.fn()
  }
}))

describe('initWithPassword', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('throws if password is not provided', async () => {
    await expect(initWithPassword({})).rejects.toThrow('Password is required')
  })

  it('delegates to pearpassVaultClient and returns true', async () => {
    pearpassVaultClient.initWithPassword.mockResolvedValue({ success: true })

    const passwordBuffer = stringToBuffer('pass')
    const result = await initWithPassword({ password: passwordBuffer })
    expect(result).toBe(true)
    expect(pearpassVaultClient.initWithPassword).toHaveBeenCalledWith(
      passwordBuffer
    )
  })
})
