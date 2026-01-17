// deno-lint-ignore no-external-import
import { assertEquals, assertGreaterOrEqual, assertStringIncludes } from 'jsr:@std/assert@1.0.16';

let spCode: number;
let spStdout: string;
let spStderr: string;

Deno.test('Ledger - Discord Slack Handler Runtime Report', async (kit) => {
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
  await kit.step('Verify Process Output Expectations', () => {
    assertEquals(spCode, 0);
    assertGreaterOrEqual(spStdout.length, 0);
    assertGreaterOrEqual(spStderr.length, 0);
  });
  await kit.step('Verify Process (stdout) Content', () => {
    assertStringIncludes(spStdout, 'discord-slack-handler');
    assertStringIncludes(spStdout, 'Slack Request (ok)');
    assertStringIncludes(spStdout, 'Discord Request (1359184708084170802)');
  });
});
