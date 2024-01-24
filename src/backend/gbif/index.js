// connect to the postgreSQL database
// listen to changes in two tables: gbif_occurrence_downloads, gbif_taxa_downloads
// also: on startup, search for any downloads that haven't been processed yet
// 1.1 register when a change occurs
//     https://gist.github.com/fritzy/5db6221bebe53eda4c2d
//     https://www.npmjs.com/package/pg-listen
// 1.2 On startup, query for any downloads that haven't been processed yet
// 2.  when a change occurs / a non processed download is found:
//     build the download request (query.json):
//     {
//       "creator": "userName",
//       "notificationAddresses": [
//         "userEmail@example.org"
//       ],
//       "sendNotification": true,
//       "format": "SIMPLE_CSV",
//       "predicate": { {
//         "type": "and",
//         "predicates": [
//             "type": "equals",
//             "key": "BASIS_OF_RECORD",
//             "value": "PRESERVED_SPECIMEN"
//           },
//           {
//             "type": "in",
//             "key": "COUNTRY",
//             "values": [
//               "VC", "GD"
//             ]
//           }
//         ]
//       }
//     }
// 3.  send the request to the GBIF API, receiving the download key:
//     curl --include --user userName:PASSWORD --header "Content-Type: application/json" --data @query.json https://api.gbif.org/v1/occurrence/download/request
// 4.  update the returned download_key in the database (in case this continues after the server restarts)
// 5.  repeatedly query the download key until the download is ready (SUCCEEDED)
//     curl -Ss https://api.gbif.org/v1/occurrence/download/0001005-130906152512535
//     if an error is returned: if key is no more valid, begin again at step 2. Else write error to database
// 6.  download and store the file in a local folder:
//     curl --location --remote-name https://api.gbif.org/occurrence/download/request/0001005-130906152512535.zip
// 7.  open the .csv file and read the data (needs lots of memory? can this be streamed?)
//     https://stackoverflow.com/a/30097538/712005
//     https://www.bezkoder.com/node-js-csv-postgresql/
//     TODO: https://www.npmjs.com/package/pg-copy-streams
//     TODO: https://www.digitalocean.com/community/tutorials/how-to-read-and-write-csv-files-in-node-js-using-node-csv
// 8.  insert the data into the postgreSQL database
//     using pg: https://node-postgres.com/apis/client or node-postgres: https://github.com/brianc/node-postgres
// 9.  delete the .csv file
// 10. update the status of the download in the database
