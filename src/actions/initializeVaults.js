import { createAsyncThunk } from '@reduxjs/toolkit'

import { init } from '../api/init'
import { listVaults } from '../api/listVaults'
import { pearpassVaultClient } from '../instances'
import { logger } from '../utils/logger'
import { runActionScan } from './../api/actionRunner'

export const initializeVaults = createAsyncThunk(
  'vaults/initializeVaults',
  async ({ ciphertext, nonce, salt, hashedPassword, password }) => {
    await init({
      ciphertext,
      nonce,
      salt,
      hashedPassword,
      password
    })

    await safeStartPersonalSwarm()
    runActionScan().catch(() => {})

    return listVaults()
  }
)

const safeStartPersonalSwarm = async () => {
  if (typeof pearpassVaultClient?.personalSwarmInit !== 'function') return
  try {
    await pearpassVaultClient.personalSwarmInit()
  } catch (err) {
    logger.error('initializeVaults: personalSwarmInit failed', { err })
  }
}
