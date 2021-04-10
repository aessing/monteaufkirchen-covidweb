const tableStore = require(`azure-storage`);

module.exports = async function (context, req) {
  const authKey = req.query.authkey || (req.body && req.body.authkey);
  let responseStatus;

  if (process.env['RESET_AUTH_KEY'] === authKey) {
    let classes = await getClasses();
    responseStatus = await resetTestStatus(classes);
  } else {
    responseStatus = 401;
  }

  let responseMessage;

  switch (responseStatus) {
    case 200:
      responseMessage = `SUCCESS: Reset status of all classes`;
      break;
    case 401:
      responseMessage = `ERROR: AuthKey mismatch`;
      break;
    case 500:
      responseMessage = `ERROR: Couldn't update status of all classes`;
      break;
    default:
      responseMessage = `UNDEFINED: Unknown error`;
  }

  context.res = {
    status: responseStatus,
    body: `{ "statusMessage": "${responseMessage}" }`,
    headers: {
      'Content-Type': 'application/json',
      'X-Content-Type-Options': 'nosniffs',
    },
  };
};

async function getClasses() {
  const tableService = tableStore.createTableService();
  const statusQuery = new tableStore.TableQuery().select(`PartitionKey`);

  return new Promise(function (resolve) {
    tableService.queryEntities(process.env['STATUSTABLE_NAME'], statusQuery, null, function (error, result) {
      if (!error) {
        let entities = result.entries;
        let resultSet = new Array();

        entities.forEach(function (entity) {
          resultSet.push(entity.PartitionKey._);
        });

        resolve(resultSet);
      }
    });
  });
}

async function resetTestStatus(classList) {
  const tableService = tableStore.createTableService();

  return new Promise(function (resolve, reject) {
    classList.forEach(function (entity) {
      const updatedStatus = {
        PartitionKey: {
          _: entity,
        },
        RowKey: {
          _: '',
        },
        Status: {
          _: 0,
        },
      };

      tableService.replaceEntity(process.env['STATUSTABLE_NAME'], updatedStatus, function (error) {
        if (!error) {
          resolve(200);
        } else {
          reject(500);
        }
      });
    });
  });
}
