import { startSandbox } from "./packages/ai/tools/sandbox";

async function testSandbox() {
  try {
    log.info("Testing sandbox with HTTP server...");
    
    const sandboxTool = startSandbox();
    const result = await sandboxTool.execute({
      files: { '/main.py': 'print("Hello VT")' },
      cmd: 'python -m http.server 8000',
      port: 8000
    });
    
    log.info("Sandbox result:", result);
  } catch (error) {
    log.error("Error:", error);
  }
}

testSandbox();