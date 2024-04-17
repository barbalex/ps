export const generateVectorLayerTriggers = async (db) => {
  // on insert vector_layers if type is in:
  // places1, places2, actions1, actions2, checks1, checks2, occurrences-assigned, occurrences-to-assess, occurrences-not-to-assign
  // create a corresponding vector_layer_display
  // ISSUE: how to create v7 uuids? https://github.com/rhashimoto/wa-sqlite/discussions/169, https://github.com/craigpastro/sqlite-uuidv7/issues/3
  // TODO: this is not finished
  const triggers = await db.triggers.findMany()
  const vectorLayerInsertTriggerExists = triggers.some(
    (column) => column.name === 'vector_layers_insert_trigger',
  )
  if (!vectorLayerInsertTriggerExists) {
    await db.unsafeExec({
      sql: `
      CREATE TRIGGER IF NOT EXISTS vector_layers_insert_trigger
        AFTER INSERT ON vector_layers
      BEGIN
        INSERT INTO vector_layer_displays (vector_layer_id)
        VALUES (NEW.vector_layer_id);
      END;`,
    })
  }
}
