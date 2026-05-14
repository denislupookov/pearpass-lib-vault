import { processInbox } from './inbox'
import { processOutbox } from './outbox'
import { processPendingActions } from './processPendingActions'
import { logger } from '../utils/logger'

let isProcessing = false
let pendingRescan = false

/** @returns {Promise<void>} */
export const runActionScan = async () => {
  if (isProcessing) {
    pendingRescan = true
    return
  }

  isProcessing = true
  try {
    do {
      pendingRescan = false

      try {
        await processInbox()
      } catch (err) {
        logger.error('runActionScan: processInbox failed', err)
      }

      try {
        await processOutbox()
      } catch (err) {
        logger.error('runActionScan: processOutbox failed', err)
      }

      try {
        await processPendingActions()
      } catch (err) {
        // Legacy queue path requires an active vault; ok to skip silently
        // when we're called outside that context.
        logger.log(
          'runActionScan: processPendingActions skipped',
          err?.message ?? err
        )
      }
    } while (pendingRescan)
  } finally {
    isProcessing = false
  }
}
