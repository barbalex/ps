import 'dotenv/config'
import { makePgTsGenerator } from 'kanel'

const databaseUrl = process.env.KANEL_DATABASE_URL || process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error(
    'Missing database URL. Set KANEL_DATABASE_URL (preferred) or DATABASE_URL.',
  )
}

/** @type {import("kanel").Config} */
const config = {
  connection: databaseUrl,
  filter: (pgType) => pgType.kind !== 'foreignTable',
  outputPath: './src/models',
  preDeleteOutputFolder: true,
  typescriptConfig: {
    tsModuleFormat: 'esm',
  },
  generators: [makePgTsGenerator()],
}

export default config
