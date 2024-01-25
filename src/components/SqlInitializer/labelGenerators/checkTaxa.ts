// TODO: db.raw is deprecated in v0.9
// https://electric-sql.com/docs/usage/data-access/queries#raw-sql
// try db.rawQuery instead for reading data
// alternatively use db.unsafeExec(sql): https://electric-sql.com/docs/api/clients/typescript#instantiation
export const generateCheckTaxonLabel = async (db) => {
  // if check_taxon_id is changed, update the label
  const triggers = await db.raw({
    sql: `select name from sqlite_master where type = 'trigger';`,
  })
  const checkTaxonLabelTriggerExists = triggers.some(
    (column) => column.name === 'check_taxon_label_trigger',
  )
  if (!checkTaxonLabelTriggerExists) {
    const result = await db.raw({
      sql: `
      CREATE TRIGGER IF NOT EXISTS check_taxon_label_trigger
        AFTER UPDATE OF taxon_id ON check_taxa
      BEGIN
        UPDATE check_taxa SET label = iif(
          (SELECT name FROM taxa WHERE taxon_id = NEW.taxon_id) is not null,
          concat(
            (SELECT name FROM taxonomies where taxonomy_id = (select taxonomy_id from taxa where taxon_id = NEW.taxon_id)),
            ': ',
            (SELECT name FROM taxa WHERE taxon_id = NEW.taxon_id)
          ),
          NEW.check_taxon_id
        );
      END;`,
    })
    console.log('TriggerGenerator, check_taxa, result:', result)
    // same on insert
    await db.raw({
      sql: `
      CREATE TRIGGER IF NOT EXISTS check_taxon_label_trigger_insert
        AFTER INSERT ON check_taxa
      BEGIN
        UPDATE check_taxa SET label = NEW.check_taxon_id;
      END;`,
    })
  }
}
