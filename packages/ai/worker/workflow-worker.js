// Workflow worker implementation
self.onmessage = function (event) {
    const { type, data, payload } = event.data; // Added payload for START_WORKFLOW

    switch (type) {
        case 'START_WORKFLOW':
            // Handle workflow start
            // In a real scenario, you would import and run your actual workflow logic here
            // For now, just echoing back that it started
            self.postMessage({ type: 'WORKFLOW_STARTED', data: payload }); // Use payload
            break;
        case 'STOP_WORKFLOW':
            // Handle workflow stop
            self.postMessage({ type: 'WORKFLOW_STOPPED' });
            break;
        case 'ABORT_WORKFLOW':
            // Handle workflow abort
            // In a real scenario, you would gracefully stop any ongoing processes
            self.postMessage({ type: 'WORKFLOW_ABORTED', data: payload });
            break;
        default:
            self.postMessage({ type: 'UNKNOWN_MESSAGE', data: event.data });
    }
};
