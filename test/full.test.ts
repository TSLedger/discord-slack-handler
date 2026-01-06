// deno-lint-ignore no-external-import
import { assertEquals, assertGreaterOrEqual, assertStringIncludes } from 'jsr:@std/assert@1.0.16';

let spCode: number;
let spStdout: string;
let spStderr: string;

Deno.test('Ledger - Console Handler Runtime Report', async (kit) => {
  await kit.step('Dispatch Process', async () => {
    const command = new Deno.Command(Deno.execPath(), {
      args: ['run', '--allow-all', './test/mock-runtime.ts'],
      stdout: 'piped',
      stderr: 'piped',
    });

    const decoder = new TextDecoder();
    const { code, stdout, stderr } = await command.output();
    spCode = code;
    spStdout = decoder.decode(stdout);
    spStderr = decoder.decode(stderr);
  });
  await kit.step('Verify Process Output Expectations', async () => {
    assertEquals(spCode, 0);
    assertGreaterOrEqual(spStdout.length, 0);
    assertGreaterOrEqual(spStderr.length, 0);
  });
  await kit.step('Verify Process (stdout) Content', async () => {
    // Base
    assertStringIncludes(spStdout, 'Test IPC Service');
    assertStringIncludes(spStdout, 'Validating API');
    // Levels
    assertStringIncludes(spStdout, 'TRACE');
    assertStringIncludes(spStdout, 'Trace');
    assertStringIncludes(spStdout, 'INFORMATION');
    assertStringIncludes(spStdout, 'Information');
    // Properties
    assertStringIncludes(spStdout, 'some test');
    assertStringIncludes(spStdout, 'Object.assign(');
    assertStringIncludes(spStdout, 'new Error("Test Error"),');
    assertStringIncludes(spStdout, 'array');
    assertStringIncludes(spStdout, 'set');
    assertStringIncludes(spStdout, 'map');
    assertStringIncludes(spStdout, 'k1');
    assertStringIncludes(spStdout, 'v1');
    assertStringIncludes(spStdout, 'k2');
    assertStringIncludes(spStdout, 'v2');
    assertStringIncludes(spStdout, 'nested');
    assertStringIncludes(spStdout, '"d": "deep"');
    assertStringIncludes(spStdout, '"date": new Date(1735689600000)');
  });
  await kit.step('Verify Process (stderr) Content', async () => {
    // Base
    assertStringIncludes(spStderr, 'Test IPC Service');
    assertStringIncludes(spStderr, 'Validating API');
    // Levels
    assertStringIncludes(spStderr, 'WARNING');
    assertStringIncludes(spStderr, 'Warning');
    assertStringIncludes(spStderr, 'SEVERE');
    assertStringIncludes(spStderr, 'Severe');
    // Properties
    assertStringIncludes(spStderr, 'some test');
    assertStringIncludes(spStderr, 'Object.assign(');
    assertStringIncludes(spStderr, 'new Error("Test Error"),');
    assertStringIncludes(spStderr, 'array');
    assertStringIncludes(spStderr, 'set');
    assertStringIncludes(spStderr, 'map');
    assertStringIncludes(spStderr, 'k1');
    assertStringIncludes(spStderr, 'v1');
    assertStringIncludes(spStderr, 'k2');
    assertStringIncludes(spStderr, 'v2');
    assertStringIncludes(spStderr, 'nested');
    assertStringIncludes(spStderr, '"d": "deep"');
    assertStringIncludes(spStderr, '"date": new Date(1735689600000)');
  });
});
