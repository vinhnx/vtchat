export async function CodemodPeriodicUpdate() {
    const runnerPath =
        '/Users/vinhnguyenxuan/Developer/learn-by-doing/vtchat/.opencode/codemod/periodic-update/check-updates.sh';
    return {
        event: async ({ event, $ }) => {
            if (event?.type !== 'session.idle') {
                return;
            }

            try {
                await $`sh ${runnerPath}`;
            } catch {
                // Best-effort only: keep startup non-blocking.
            }
        },
    };
}
