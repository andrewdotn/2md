import { access } from "fs/promises";

export async function pathExists(path: string) {
  try {
    await access(path);
    return true;
  } catch (e) {
    if (e instanceof Error && "code" in e && e.code === "ENOENT") {
      return false;
    }
    throw e;
  }
}
