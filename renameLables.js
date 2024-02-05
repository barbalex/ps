import fs from 'fs'

// read src\generated\client\index.ts and replace all label_replace_by_generated_column by label
fs.readFile('src/generated/client/index.ts', 'utf8', function (err, data) {
  if (err) {
    return console.log(err)
  }
  var result = data.replace(/label_replace_by_generated_column/g, 'label')

  fs.writeFile('src/generated/client/index.ts', result, 'utf8', function (err) {
    if (err) return console.log(err)
    console.log(
      'label_replace_by_generated_column replaced by label in src/generated/client/index.ts',
    )
  })
})

// read src\generated\client\prismaClient.d.ts and replace all label_replace_by_generated_column by label
fs.readFile(
  'src/generated/client/prismaClient.d.ts',
  'utf8',
  function (err, data) {
    if (err) {
      return console.log(err)
    }
    var result = data.replace(/label_replace_by_generated_column/g, 'label')

    fs.writeFile(
      'src/generated/client/prismaClient.d.ts',
      result,
      'utf8',
      function (err) {
        if (err) return console.log(err)
        console.log(
          'label_replace_by_generated_column replaced by label in src/generated/client/prismaClient.d.ts',
        )
      },
    )
  },
)
