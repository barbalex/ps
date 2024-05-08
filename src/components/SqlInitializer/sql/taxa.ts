export const generateTaxonLabel = async (db) => {
  const triggers = await db.rawQuery({
    sql: `select name from sqlite_master where type = 'trigger';`,
  })
  const triggerExists = triggers.some(
    (column) => column.name === 'taxa_label_trigger',
  )
  if (!triggerExists) {
    await db.unsafeExec({
      sql: `
      CREATE TRIGGER if not exists taxa_label_trigger
      AFTER UPDATE of taxonomy_id, name ON taxa
      BEGIN
        UPDATE taxa SET label = case 
        when taxonomies.name is null then taxon_id
        else concat(taxonomies.name, ' (', taxonomies.type, '): ', taxa.name)
        end
        FROM (
          SELECT name, type from taxonomies 
          where taxonomy_id = NEW.taxonomy_id
        ) as taxonomies
         WHERE taxa.taxon_id = NEW.taxon_id;
      END`,
    })
    console.log('generated taxon labels')
  }
  // same on insert
  const insertTriggerExists = triggers.some(
    (column) => column.name === 'taxa_label_insert_trigger',
  )
  if (!insertTriggerExists) {
    await db.unsafeExec({
      sql: `
      CREATE TRIGGER if not exists taxa_label_insert_trigger
      AFTER INSERT ON taxa
      BEGIN
        UPDATE taxa SET label = case 
          when taxonomies.name is null then taxon_id
          else concat(taxonomies.name, ' (', taxonomies.type, '): ', taxa.name)
        end
        FROM (
          SELECT name, type from taxonomies 
          where taxonomy_id = NEW.taxonomy_id
        ) as taxonomies
         WHERE taxa.taxon_id = NEW.taxon_id;
      END`,
    })
  }
}
