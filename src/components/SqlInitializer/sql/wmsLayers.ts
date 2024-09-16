export const generateWmsLayerTriggers = async (db) => {
  // on insert wms_layers if type is in:
  // places1, places2, actions1, actions2, checks1, checks2, occurrences_assigned1, occurrences_assigned2, occurrences_to_assess, occurrences_not_to_assign
  // create a corresponding wms_layer_display
  // ISSUE: how to create v7 uuids? https://github.com/rhashimoto/wa-sqlite/discussions/169, https://github.com/craigpastro/sqlite-uuidv7/issues/3
  // TODO: this is not finished
  const triggers = await db.triggers.findMany()
  const wmsLayerInsertTriggerExists = triggers.some(
    (column) => column.name === 'wms_layers_insert_trigger',
  )
  if (!wmsLayerInsertTriggerExists) {
    await db.unsafeExec({
      sql: `
      CREATE TRIGGER IF NOT EXISTS wms_layers_insert_trigger
        AFTER INSERT ON wms_layers
      BEGIN
        INSERT INTO layer_presentations (wms_layer_id)
        VALUES (NEW.wms_layer_id);
      END;`,
    })
  }
}
