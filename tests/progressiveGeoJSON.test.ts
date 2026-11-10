import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Feature, FeatureCollection, Geometry } from 'geojson'

import {
  addProgressively,
  flattenGeoJSON,
} from '../src/components/Map/layers/progressiveGeoJSON.ts'

const pointFeature = (i: number): Feature => ({
  type: 'Feature',
  properties: { i },
  geometry: { type: 'Point', coordinates: [0, i] },
})

const featureCollection = (from: number, to: number): FeatureCollection => ({
  type: 'FeatureCollection',
  features: Array.from({ length: to - from }, (_, k) => pointFeature(from + k)),
})

/** requestAnimationFrame stand-in queueing frames until flush() */
const createManualScheduler = () => {
  const queued: { id: number; callback: () => void }[] = []
  let nextId = 1
  const schedule = (callback: () => void) => {
    const id = nextId++
    queued.push({ id, callback })
    return id
  }
  const cancelSchedule = (handle: number) => {
    const index = queued.findIndex((entry) => entry.id === handle)
    if (index !== -1) queued.splice(index, 1)
  }
  const flush = (frames = 1) => {
    for (let frame = 0; frame < frames; frame++) {
      const due = [...queued]
      queued.length = 0
      for (const { callback } of due) callback()
    }
  }
  return { schedule, cancelSchedule, flush, pending: () => queued.length }
}

/** collects chunk sizes grouped by frame: [0] is the synchronous first frame */
const createFrameRecorder = () => {
  const sizes: number[][] = []
  let frameSizes: number[] | null = null
  return {
    sizes,
    endFrame: () => {
      frameSizes = null
    },
    addChunk: (chunk: (Feature | Geometry)[]) => {
      if (!frameSizes) {
        frameSizes = []
        sizes.push(frameSizes)
      }
      frameSizes.push(chunk.length)
    },
  }
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('flattenGeoJSON', () => {
  it('returns an empty list for no data', () => {
    expect(flattenGeoJSON(null)).toEqual([])
    expect(flattenGeoJSON(undefined)).toEqual([])
    expect(flattenGeoJSON([])).toEqual([])
  })

  it('returns the features of a single FeatureCollection', () => {
    expect(flattenGeoJSON(featureCollection(0, 2))).toEqual([
      pointFeature(0),
      pointFeature(1),
    ])
  })

  it('concatenates the features of an array of FeatureCollections', () => {
    expect(
      flattenGeoJSON([featureCollection(0, 2), featureCollection(2, 4)]),
    ).toEqual([
      pointFeature(0),
      pointFeature(1),
      pointFeature(2),
      pointFeature(3),
    ])
  })

  it('keeps bare features and geometries', () => {
    const geometry: Geometry = { type: 'Point', coordinates: [1, 2] }
    expect(flattenGeoJSON([pointFeature(7), geometry])).toEqual([
      pointFeature(7),
      geometry,
    ])
  })

  it('tolerates a FeatureCollection without features', () => {
    expect(
      flattenGeoJSON({
        type: 'FeatureCollection',
      } as unknown as FeatureCollection),
    ).toEqual([])
  })
})

describe('addProgressively', () => {
  it('adds everything in chunkSize batches per frame, the first synchronously', () => {
    const scheduler = createManualScheduler()
    const recorder = createFrameRecorder()
    const items = Array.from({ length: 1000 }, (_, i) => pointFeature(i))
    const added: number[] = []
    const index = (item: Feature | Geometry) =>
      (item as { properties: { i: number } }).properties.i

    addProgressively(
      items,
      (chunk) => {
        recorder.addChunk(chunk)
        added.push(...chunk.map(index))
      },
      {
        // a huge budget keeps the frame limit purely chunkSize-based
        chunkSize: 300,
        budgetMs: 1e9,
        schedule: scheduler.schedule,
        cancelSchedule: scheduler.cancelSchedule,
      },
    )
    recorder.endFrame()

    // first frame is synchronous, in sub-batches of 50
    expect(recorder.sizes[0]).toEqual([50, 50, 50, 50, 50, 50])

    scheduler.flush(1)
    recorder.endFrame()
    scheduler.flush(1)
    recorder.endFrame()
    scheduler.flush(1)

    expect(recorder.sizes).toEqual([
      [50, 50, 50, 50, 50, 50],
      [50, 50, 50, 50, 50, 50],
      [50, 50, 50, 50, 50, 50],
      [50, 50],
    ])
    // everything was added, in order
    expect(added).toEqual(Array.from({ length: 1000 }, (_, i) => i))
    expect(scheduler.pending()).toBe(0)
  })

  it('stops adding once cancelled', () => {
    const scheduler = createManualScheduler()
    const recorder = createFrameRecorder()
    const items = Array.from({ length: 1000 }, (_, i) => pointFeature(i))

    const cancel = addProgressively(items, recorder.addChunk, {
      chunkSize: 300,
      budgetMs: 1e9,
      schedule: scheduler.schedule,
      cancelSchedule: scheduler.cancelSchedule,
    })
    recorder.endFrame()

    scheduler.flush(1)
    recorder.endFrame()

    cancel()
    cancel() // idempotent
    scheduler.flush(10)

    // two frames had been added (the synchronous one plus one flushed)
    expect(recorder.sizes).toEqual([
      [50, 50, 50, 50, 50, 50],
      [50, 50, 50, 50, 50, 50],
    ])
    expect(scheduler.pending()).toBe(0)
  })

  it('aborts when addChunk returns false', () => {
    const scheduler = createManualScheduler()
    const recorder = createFrameRecorder()
    const items = Array.from({ length: 1000 }, (_, i) => pointFeature(i))
    let chunks = 0

    addProgressively(
      items,
      (chunk) => {
        recorder.addChunk(chunk)
        chunks++
        return chunks === 2 ? false : undefined
      },
      {
        budgetMs: 1e9,
        schedule: scheduler.schedule,
        cancelSchedule: scheduler.cancelSchedule,
      },
    )

    expect(recorder.sizes).toEqual([[50, 50]])
    expect(scheduler.pending()).toBe(0)
  })

  it('ends a frame early once the time budget is exhausted', () => {
    const scheduler = createManualScheduler()
    const recorder = createFrameRecorder()
    const items = Array.from({ length: 1000 }, (_, i) => pointFeature(i))

    // frame start, first budget check, then way over budget
    const now = vi.spyOn(performance, 'now')
    now.mockImplementationOnce(() => 0)
      .mockImplementationOnce(() => 0)
      .mockImplementationOnce(() => 999)

    addProgressively(items, recorder.addChunk, {
      budgetMs: 12,
      chunkSize: 300,
      schedule: scheduler.schedule,
      cancelSchedule: scheduler.cancelSchedule,
    })
    recorder.endFrame()

    // budget ran out after the first sub-batch; the next frame is scheduled
    expect(recorder.sizes[0]).toEqual([50])
    expect(scheduler.pending()).toBe(1)

    // later frames use real timestamps and continue up to chunkSize
    scheduler.flush(1)
    expect(recorder.sizes[1]).toEqual([50, 50, 50, 50, 50, 50])
  })

  it('adds nothing for empty data and schedules no frame', () => {
    const scheduler = createManualScheduler()
    const addChunk = vi.fn()

    addProgressively([], addChunk, {
      schedule: scheduler.schedule,
      cancelSchedule: scheduler.cancelSchedule,
    })

    expect(addChunk).not.toHaveBeenCalled()
    expect(scheduler.pending()).toBe(0)
  })
})
