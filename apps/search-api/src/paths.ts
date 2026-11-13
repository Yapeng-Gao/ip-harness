import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
/** apps/search-api */
export const APP_ROOT = path.resolve(here, '..')
export const DATA_DIR = path.join(APP_ROOT, 'data')
export const SAMPLES_DIR = path.join(DATA_DIR, 'samples')
export const OBJECTS_DIR = path.join(DATA_DIR, 'objects')
export const DB_PATH = path.join(DATA_DIR, 'search.db')
export const PORT = Number(process.env.PORT) || 5190
