import { spawn } from "child_process";
import { inspect } from "util";

export function run(
  cmd: string[]
): Promise<{ stdout: string; stderr: string }> {
  const proc = spawn(cmd[0], cmd.slice(1), {
    stdio: ["ignore", "pipe", "pipe"]
  });

  const output = { stdout: "", stderr: "" };

  proc.stdio[1]!.on("data", data => (output.stdout += data));
  proc.stdio[2]!.on("data", data => (output.stderr += data));

  return new Promise((resolve, reject) => {
    proc.on("error", e => reject(e));
    proc.on("exit", (code, signal) => {
      if (code === 1 && /\(-1700\)$/m.test(output.stderr)) {
        return reject(
          new Error(
            "The clipboard does not currently contain HTML-formatted data."
          )
        );
      }
      if (code !== 0 || signal) {
        return reject(
          new Error(
            `${inspect(
              cmd
            )} returned [${code}, ${signal}]; output was ${inspect(output)}`
          )
        );
      }

      return resolve(output);
    });
  });
}
