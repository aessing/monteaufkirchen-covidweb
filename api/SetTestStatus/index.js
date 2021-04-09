const tableStore = require(`azure-storage`);

module.exports = async function (context, req) {
  const testClass = req.query.class || (req.body && req.body.class);
  const testStatus = req.query.status || (req.body && req.body.status);

  let responseStatus = await setTestStatus(testClass, testStatus);
  let responseMessage;

  switch (responseStatus) {
    case 200:
      responseMessage = `SUCCESS: Updated status of class ${testClass} to ${testStatus}`;
      break;
    case 500:
      responseMessage = `ERROR: Couldn't update status of class ${testClass} to ${testStatus}`;
      break;
    default:
      responseMessage = `UNDEFINED: Unknown error`;
  }

  context.res = {
    status: responseStatus,
    body: responseMessage,
  };
};

async function setTestStatus(testClass, testStatus) {
  const tableService = tableStore.createTableService();

  const updatedStatus = {
    PartitionKey: {
      _: testClass,
    },
    RowKey: {
      _: "",
    },
    Status: {
      _: testStatus,
    },
  };

  return new Promise(function (resolve, reject) {
    tableService.insertOrReplaceEntity(
      process.env["STATUSTABLE_NAME"],
      updatedStatus,
      function (error) {
        if (!error) {
          resolve(200);
        } else {
          reject(500);
        }
      }
    );
  });
}
