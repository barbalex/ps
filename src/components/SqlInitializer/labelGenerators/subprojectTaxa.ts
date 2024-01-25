// TODO: db.raw is deprecated in v0.9
// https://electric-sql.com/docs/usage/data-access/queries#raw-sql
// try db.rawQuery instead for reading data
// alternatively use db.unsafeExec(sql): https://electric-sql.com/docs/api/clients/typescript#instantiation
export const generateSubprojectTaxonLabel = async (db) => {
  // if taxon_id is changed, update the label
  const triggers = await db.raw({
    sql: `select name from sqlite_master where type = 'trigger';`,
  })
  const subprojectTaxonLabelTriggerExists = triggers.some(
    (column) => column.name === 'subproject_taxon_label_trigger',
  )
  if (!subprojectTaxonLabelTriggerExists) {
    const result = await db.raw({
      sql: `
      CREATE TRIGGER IF NOT EXISTS subproject_taxon_label_trigger
        AFTER UPDATE OF taxon_id ON subproject_taxa
      BEGIN
        UPDATE subproject_taxa SET label = iif(
          (SELECT name FROM taxa WHERE taxon_id = NEW.taxon_id) is not null,
          concat(
            (SELECT name FROM taxonomies where taxonomy_id = (select taxonomy_id from taxa where taxon_id = NEW.taxon_id)),
            ': ',
            (SELECT name FROM taxa WHERE taxon_id = NEW.taxon_id)
          ),
          NEW.subproject_taxon_id
        );
      END;`,
    })
    console.log('TriggerGenerator, subproject_taxa, result:', result)
    // same on insert
    await db.raw({
      sql: `
      CREATE TRIGGER IF NOT EXISTS subproject_taxon_label_trigger_insert
        AFTER INSERT ON subproject_taxa
      BEGIN
        UPDATE subproject_taxa SET label = NEW.subproject_taxon_id;
      END;`,
    })
  }
}
