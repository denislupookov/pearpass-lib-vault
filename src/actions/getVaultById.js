import { createAsyncThunk } from '@reduxjs/toolkit'

import { addDevice as addDeviceApi } from '../api/addDevice'
import { getVaultById as getVaultByIdApi } from '../api/getVaultById'
import { listDevices } from '../api/listDevices'
import { listRecords } from '../api/listRecords'
import { getCurrentDeviceName, pearpassVaultClient } from '../instances'
import { logger } from '../utils/logger'

export const getVaultById = createAsyncThunk(
  'vault/getVault',
  async ({ vaultId, params } = {}) => {
    if (!vaultId) {
      throw new Error('Vault ID is required')
    }

    const vault = await getVaultByIdApi(vaultId, params)

    if (!vault) {
      throw new Error('Vault not found ' + vaultId)
    }

    const records = (await listRecords(vault.id)) ?? []
    const devices = (await listDevices(vault.id)) ?? []

    const healedDevices = await healLocalDeviceEntry(devices)

    return {
      ...vault,
      records: records ?? [],
      devices: healedDevices
    }
  }
)

const healLocalDeviceEntry = async (devices) => {
  try {
    const deviceName = getCurrentDeviceName()
    if (!deviceName) return devices
    const existing = devices.find((d) => d?.name === deviceName)
    if (!existing) return devices
    const writerKey =
      (await pearpassVaultClient?.activeVaultGetWriterKey?.()) ?? null
    const masterTopic =
      typeof pearpassVaultClient?.personalSwarmGetTopic === 'function'
        ? (await pearpassVaultClient.personalSwarmGetTopic()) || null
        : null
    if (
      existing.writerKey === writerKey &&
      (existing.masterTopic ?? null) === masterTopic
    ) {
      return devices
    }
    const healed = { ...existing, writerKey, createdAt: Date.now() }
    if (masterTopic) healed.masterTopic = masterTopic
    else delete healed.masterTopic
    await addDeviceApi(healed)
    return devices.map((d) => (d.id === healed.id ? healed : d))
  } catch (err) {
    logger.error('getVaultById: device heal failed', { err })
    return devices
  }
}
