// connect to the postgreSQL database
// listen to changes in two tables: gbif_occurrence_downloads, gbif_taxa_downloads
// also: on startup, search for any downloads that haven't been processed yet
// when a change occurs / a download is found:
// 1. build the download request (query.json):
// {
//   "creator": "userName",
//   "notificationAddresses": [
//     "userEmail@example.org"
//   ],
//   "sendNotification": true,
//   "format": "SIMPLE_CSV",
//   "predicate": { {
//     "type": "and",
//     "predicates": [
//         "type": "equals",
//         "key": "BASIS_OF_RECORD",
//         "value": "PRESERVED_SPECIMEN"
//       },
//       {
//         "type": "in",
//         "key": "COUNTRY",
//         "values": [
//           "VC", "GD"
//         ]
//       }
//     ]
//   }
// }
// 2. send the request to the GBIF API, receiving the download key:
//    curl --include --user userName:PASSWORD --header "Content-Type: application/json" --data @query.json https://api.gbif.org/v1/occurrence/download/request
// 3. update the returned download_key in the database (in case this continues after the server restarts)
// 4. repeatedly query the download key until the download is ready (SUCCEEDED)
//    curl -Ss https://api.gbif.org/v1/occurrence/download/0001005-130906152512535
//    if an error is returned: if key is no more valid, begin again at step 2. Else write error to database
// 5. download and store the file in a local folder:
//    curl --location --remote-name https://api.gbif.org/occurrence/download/request/0001005-130906152512535.zip
// 6. open the .csv file and read the data (needs lots of memory? can this be streamed?)
// 7. insert the data into the postgreSQL database
// 8. delete the .csv file
// 9. update the status of the download in the database
