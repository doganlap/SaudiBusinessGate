import { spawnSync } from 'node:child_process'

function run(cmd: string, args: string[], env: NodeJS.ProcessEnv) {
  const r = spawnSync(cmd, args, { stdio: 'inherit', env })
  if (r.status !== 0) process.exit(r.status ?? 1)
}

const env = { ...process.env }

run('npx', ['prisma', 'generate'], env)
run('npm', ['run', 'db:migrate'], env)
run('npm', ['run', 'db:seed:finance'], env)
run('npm', ['run', 'db:seed:modules'], env)
