import React, { useEffect } from 'react'
import { makeElectricContext, useLiveQuery } from 'electric-sql/react'
import { observer } from '@legendapp/state/react'
import { genUUID } from 'electric-sql/util'

import { Electric, Items as Item } from './generated/client'

import './Example.css'

import { useElectric } from './ElectricProvider'

export const Example = () => {
  const { db } = useElectric()!
  const { results } = useLiveQuery(db.items.liveMany())

  useEffect(() => {
    const syncItems = async () => {
      // Resolves when the shape subscription has been established.
      const shape = await db.items.sync()

      // Resolves when the data has been synced into the local database.
      await shape.synced
    }

    syncItems()
  }, [])

  const addItem = async () => {
    await db.items.create({
      data: {
        value: genUUID(),
      },
    })
  }

  const clearItems = async () => {
    await db.items.deleteMany()
  }

  const items: Item[] = results ?? []

  return (
    <div>
      <div className="controls">
        <button className="button" onClick={addItem}>
          Add
        </button>
        <button className="button" onClick={clearItems}>
          Clear
        </button>
      </div>
      {items.map((item: Item, index: number) => (
        <p key={index} className="item">
          <code>{item.value}</code>
        </p>
      ))}
    </div>
  )
}
