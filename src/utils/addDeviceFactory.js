import { generateUniqueId } from '@tetherto/pear-apps-utils-generate-unique-id'

import { validateAndPrepareDevice } from './validateAndPrepareDevice'

/**
 * @param {string} deviceName - device name (e.g. `Platform.OS + ' ' + Platform.Version`)
 * @param {string} vaultId
 * @param {string} writerKey - the autobase writer key for this device on this vault
 * @param {string} [masterTopic] - hex-encoded personal swarm topic for this device
 * @returns {Object}
 */
export const addDeviceFactory = (
  deviceName,
  vaultId,
  writerKey,
  masterTopic
) => {
  if (!deviceName || !vaultId || !writerKey) {
    throw new Error('deviceName, vaultId and writerKey are required')
  }

  const device = {
    id: generateUniqueId(),
    vaultId: vaultId,
    name: deviceName,
    writerKey,
    createdAt: Date.now()
  }
  if (masterTopic) device.masterTopic = masterTopic

  return validateAndPrepareDevice(device)
}
