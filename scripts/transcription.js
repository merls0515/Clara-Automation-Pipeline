import fs from "fs";
import path from "path";

export function transcribe(filePath) {
  // Mock transcription: just read the file content
  const content = fs.readFileSync(filePath, "utf-8");
  return content;
}
