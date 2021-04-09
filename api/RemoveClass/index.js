const tableStore = require(`azure-storage`);

module.exports = async function (context, req) {
  const testClass = req.query.class || (req.body && req.body.class);

  let responseStatus = await removeClass(testClass);
  let responseMessage;

  switch (responseStatus) {
    case 200:
      responseMessage = `SUCCESS: Deleted class ${testClass}`;
      break;
    case 500:
      responseMessage = `ERROR: Couldn't delete class ${testClass}`;
      break;
    default:
      responseMessage = `UNDEFINED: Unknown error`;
  }

  context.res = {
    status: responseStatus,
    body: responseMessage,
  };
};

async function removeClass(testClass) {
  const tableService = tableStore.createTableService();

  const updatedStatus = {
    PartitionKey: {
      _: testClass,
    },
    RowKey: {
      _: "",
    },
  };

  return new Promise(function (resolve, reject) {
    tableService.deleteEntity(
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
