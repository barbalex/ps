import { createUiOption } from '../../modules/createRows'

export const generateUiOptions = async ({ db, user_id }) => {
  const uiOption = await db.ui_options.findUnique({ where: { user_id } })
  if (!uiOption) {
    const result = await db.ui_options.create({
      data: createUiOption({ user_id }),
    })
    console.log('SqlInitialiser: Ui created, result:', result)
  }
}
