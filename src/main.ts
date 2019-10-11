import {spawn} from 'child_process';
import { inspect } from 'util';
import {toMd} from "./2md";

export function run(cmd: string[]): Promise<{stdout: string, stderr: string}> {
    const proc = spawn(cmd[0], cmd.slice(1), {
        stdio: ['ignore', 'pipe', 'pipe']
    });

    const output = {stdout: '', stderr: ''};

    proc.stdio[1]!.on('data', data => output.stdout += data);
    proc.stdio[2]!.on('data', data => output.stderr += data);

    return new Promise((resolve, reject) => {
        proc.on('error', e => reject(e));
        proc.on('exit', (code, signal) => {
            if (code === 1 && /\(-1700\)$/m.test(output.stderr)) {
                return reject(new Error("The clipboard does not currently contain HTML-formatted data."));
            }
            if (code !== 0 || signal) {
                return reject(new Error(`${inspect(cmd)} returned [${code}, ${signal}]; output was ${inspect(output)}`));
            }

            return resolve(output);
        });
    });
}

async function main() {
    const osaOutput = await run(['osascript', '-e', 'the clipboard as «class HTML»']);
    const hexEncodedHtml = osaOutput.stdout;
    const match = /^«data HTML((?:[0-9A-F]{2})+)»$\n/m.exec(hexEncodedHtml);
    if (!match) {
        throw new Error("Could not parse osascript output");
    }
    const html = Buffer.from(match[1], 'hex').toString();
    console.log(toMd(html));
}

if (require.main === module) {
    main().catch(e => {
        console.error(e);
        process.exit(1);
    });
}
