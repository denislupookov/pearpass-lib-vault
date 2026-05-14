export let pearpassVaultClient

let currentDeviceNameValue = null
let envelopeSubscription = null

/**
 * @param {object} instance
 * @param {{ currentDeviceName: string }} options
 */
export const setPearpassVaultClient = (
  instance,
  { currentDeviceName } = {}
) => {
  detachEnvelopeListener()

  pearpassVaultClient = instance
  currentDeviceNameValue = currentDeviceName ?? null

  attachEnvelopeListener()
}

/**
 * @returns {string | null}
 */
export const getCurrentDeviceName = () => currentDeviceNameValue

/**
 * @param {string} path
 */
export const setStoragePath = async (path) => {
  await pearpassVaultClient.setStoragePath(path)
}

// Dynamic imports avoid a load-time cycle (inbox + actionRunner read
// pearpassVaultClient from this module).
const attachEnvelopeListener = () => {
  if (!pearpassVaultClient?.on) return
  if (envelopeSubscription) return

  envelopeSubscription = async (message) => {
    try {
      const { acceptInboundEnvelope } = await import('../api/inbox.js')
      await acceptInboundEnvelope(message)
      const { runActionScan } = await import('../api/actionRunner.js')
      runActionScan().catch(() => {})
    } catch {}
  }
  pearpassVaultClient.on('personal-swarm-envelope', envelopeSubscription)
}

const detachEnvelopeListener = () => {
  if (!pearpassVaultClient?.off || !envelopeSubscription) return
  pearpassVaultClient.off('personal-swarm-envelope', envelopeSubscription)
  envelopeSubscription = null
}
