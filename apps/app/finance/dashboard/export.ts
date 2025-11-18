export async function exportNodeToPng(selector: string, filename = "chart.png") {
  const node = document.querySelector(selector) as HTMLElement | null;
  if (!node) return;
  const svg = node.querySelector("svg") as SVGElement | null;
  if (!svg) return;
  const xml = new XMLSerializer().serializeToString(svg);
  const svg64 = btoa(unescape(encodeURIComponent(xml)));
  const image64 = "data:image/svg+xml;base64," + svg64;
  const img = new Image();
  await new Promise<void>((resolve) => {
    img.onload = () => resolve();
    img.src = image64;
  });
  const canvas = document.createElement("canvas");
  const bbox = svg.viewBox.baseVal;
  canvas.width = bbox && bbox.width ? bbox.width : svg.clientWidth || 1200;
  canvas.height = bbox && bbox.height ? bbox.height : svg.clientHeight || 600;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0);
  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = filename;
  link.click();
}