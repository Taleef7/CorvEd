import { spawnSync } from 'node:child_process'

const command = process.argv[2]
const commandArgs = process.argv.slice(3)

if (!command) {
  console.error('Usage: node scripts/with-local-supabase-env.mjs <command> [...args]')
  process.exit(1)
}

const npxCommand = process.platform === 'win32' ? 'npx.cmd' : 'npx'
const statusResult = spawnSync(npxCommand, ['supabase', 'status', '-o', 'env'], {
  encoding: 'utf8',
  stdio: ['ignore', 'pipe', 'inherit'],
  shell: process.platform === 'win32',
})

if (statusResult.status !== 0) {
  process.exit(statusResult.status ?? 1)
}

const statusOutput = statusResult.stdout

const localEnv = Object.fromEntries(
  statusOutput
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && line.includes('='))
    .map((line) => {
      const [key, ...valueParts] = line.split('=')
      const value = valueParts.join('=').replace(/^"|"$/g, '')
      return [key, value]
    }),
)

const env = {
  ...process.env,
  NEXT_PUBLIC_SUPABASE_URL: localEnv.API_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: localEnv.ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: localEnv.SERVICE_ROLE_KEY,
  CRON_SECRET: process.env.CRON_SECRET || 'local-cron-secret',
  NEXT_PUBLIC_WHATSAPP_NUMBER: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+923001234567',
  NEXT_PUBLIC_BANK_NAME: process.env.NEXT_PUBLIC_BANK_NAME || 'Local Test Bank',
  NEXT_PUBLIC_BANK_ACCOUNT_TITLE:
    process.env.NEXT_PUBLIC_BANK_ACCOUNT_TITLE || 'CorvEd Local Test',
  NEXT_PUBLIC_BANK_ACCOUNT_NUMBER:
    process.env.NEXT_PUBLIC_BANK_ACCOUNT_NUMBER || 'LOCAL-TEST-IBAN',
}

if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error('Local Supabase env was not available. Is Docker Supabase running?')
  process.exit(1)
}

const result = spawnSync(command, commandArgs, {
  env,
  shell: process.platform === 'win32',
  stdio: 'inherit',
})

process.exit(result.status ?? 1)
