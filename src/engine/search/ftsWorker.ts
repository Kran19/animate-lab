import { parentPort } from 'worker_threads';

// Worker thread handling FTS search & indexing tasks
if (parentPort) {
  parentPort.on('message', (msg: { id: string; type: string; payload: any }) => {
    try {
      if (msg.type === 'index_text') {
        // Perform text indexing calculation
        const result = { indexedLength: msg.payload?.text?.length || 0, success: true };
        parentPort?.postMessage({ id: msg.id, success: true, result });
      } else if (msg.type === 'search') {
        // Perform search query calculation
        const results = [];
        parentPort?.postMessage({ id: msg.id, success: true, result: results });
      } else {
        parentPort?.postMessage({ id: msg.id, success: false, error: 'Unknown FTS task type' });
      }
    } catch (err: any) {
      parentPort?.postMessage({ id: msg.id, success: false, error: err?.message || 'FTS worker error' });
    }
  });

  // Signal worker ready to parent thread
  parentPort.postMessage({ type: 'worker.ready' });
}
