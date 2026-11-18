import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
  definePrivilegedContracts,
  definePrivilegedHandlers,
  z,
} from "@hatch/space-sdk";
import {
  buildStaticReadme,
  buildStaticSiteHtml,
  type StaticImages,
  type StaticMapLib,
  type StaticSiteData,
} from "./static_template";

/* Host-side file access for the static-site export. The action bundle
   only carries the descriptor (imported from "@space/privileged"); this
   file is bundled separately and runs on the host, where reading the
   bundled photo assets and writing static-site/ is possible. */
export const privileged = definePrivilegedContracts({
  writeStaticSite: {
    request: z.object({
      spaceDir: z.string(),
      snapshotAt: z.string(),
      payloadJson: z.string(),
    }),
    response: z.object({
      ok: z.boolean(),
      snapshotAt: z.string(),
      totalBytes: z.number(),
      fileCount: z.number(),
      files: z.array(z.string()),
      message: z.string(),
    }),
    capabilities: ["fs.read", "fs.write"],
    timeoutMs: 60000,
  },
});

async function readImage(
  path: string,
  mime: string,
): Promise<string | null> {
  try {
    const buf = await readFile(path);
    return `data:${mime};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

/* Vendored MapLibre GL dist sources, inlined into the static page so it
   is self-contained (works from file:// / without CDN access). Either
   file missing → null, and the template falls back to the CDN tags. */
async function readMapLib(assetsDir: string): Promise<StaticMapLib> {
  try {
    const [js, css] = await Promise.all([
      readFile(join(assetsDir, "maplibre-gl.min.js"), "utf8"),
      readFile(join(assetsDir, "maplibre-gl.css"), "utf8"),
    ]);
    if (!js || !css) return null;
    return { js, css };
  } catch {
    return null;
  }
}

export const privilegedHandlers = definePrivilegedHandlers(privileged, {
  async writeStaticSite(args) {
    const data = JSON.parse(args.payloadJson) as StaticSiteData;
    const assetsDir = join(args.spaceDir, "client", "src", "assets");
    const images: StaticImages = {
      mapStatic: await readImage(join(assetsDir, "map-static.png"), "image/png"),
      aerial: await readImage(
        join(assetsDir, "site-aerial-202603.png"),
        "image/png",
      ),
      visit: await readImage(
        join(assetsDir, "site-visit-202603.jpg"),
        "image/jpeg",
      ),
      sample: await readImage(
        join(assetsDir, "site-sample-202603.png"),
        "image/png",
      ),
    };
    const mapLib = await readMapLib(assetsDir);
    const html = buildStaticSiteHtml(data, images, mapLib);
    const readme = buildStaticReadme(data);
    const outDir = join(args.spaceDir, "static-site");
    await mkdir(outDir, { recursive: true });
    const files: { name: string; content: string }[] = [
      { name: "index.html", content: html },
      { name: "README.md", content: readme },
      { name: ".nojekyll", content: "" },
    ];
    let totalBytes = 0;
    for (const f of files) {
      await writeFile(join(outDir, f.name), f.content, "utf8");
      totalBytes += Buffer.byteLength(f.content, "utf8");
    }
    return {
      ok: true,
      snapshotAt: args.snapshotAt,
      totalBytes,
      fileCount: files.length,
      files: files.map((f) => `static-site/${f.name}`),
      message: `静态站快照已生成到 static-site/（${files.length} 个文本文件，共 ${(totalBytes / 1024).toFixed(0)} KB），数据快照时间 ${data.snapshotText}。`,
    };
  },
});
