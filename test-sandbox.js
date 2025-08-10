import { startSandbox } from "./packages/ai/tools/sandbox";

async function testSandbox() {
  try {
    console.log("Testing sandbox with HTTP server...");
    
    const sandboxTool = startSandbox();
    const result = await sandboxTool.execute({
      files: { '/main.py': 'print("Hello VT")' },
      cmd: 'python -m http.server 8000',
      port: 8000
    });
    
    console.log("Sandbox result:", result);
  } catch (error) {
    console.error("Error:", error);
  }
}

testSandbox();