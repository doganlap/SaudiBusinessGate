export type Scene = {
  name: string;
  gradient: string; // CSS gradient value
  primary: string;  // "r g b" for rgb(var(--color-primary))
};

function dayOfYear(date = new Date()): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = (date as unknown as number) - (start as unknown as number);
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

const scenes: Scene[] = [
  {
    name: "Riyadh Night",
    gradient:
      "radial-gradient(1200px 800px at 20% -10%, rgba(0,120,255,0.35), transparent 60%), radial-gradient(800px 600px at 80% 110%, rgba(0,200,150,0.35), transparent 55%), linear-gradient(180deg, #0b0f17, #020203)",
    primary: "0 204 153",
  },
  {
    name: "Desert Dawn",
    gradient:
      "radial-gradient(1000px 600px at 80% -10%, rgba(255,180,0,0.35), transparent 60%), radial-gradient(800px 600px at 10% 120%, rgba(255,64,64,0.25), transparent 55%), linear-gradient(180deg, #1a0f0a, #070304)",
    primary: "255 163 72",
  },
  {
    name: "Emerald Grid",
    gradient:
      "radial-gradient(900px 700px at 0% 10%, rgba(0,255,180,0.22), transparent 60%), radial-gradient(700px 500px at 100% 90%, rgba(0,255,120,0.18), transparent 55%), linear-gradient(180deg, #06110d, #020604)",
    primary: "0 220 160",
  },
  {
    name: "Royal Violet",
    gradient:
      "radial-gradient(900px 700px at 10% -10%, rgba(170,0,255,0.28), transparent 60%), radial-gradient(700px 500px at 100% 120%, rgba(80,0,200,0.28), transparent 55%), linear-gradient(180deg, #0a0611, #030108)",
    primary: "160 120 255",
  }
];

export function getTodayScene(): Scene {
  const idx = dayOfYear() % scenes.length;
  return scenes[idx];
}
