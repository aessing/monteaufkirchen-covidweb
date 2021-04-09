const tableStore = require(`azure-storage`);

module.exports = async function (context) {
  let classes = await getClasses();
  let responseStatus = await resetTestStatus(classes);

  let responseMessage;

  console.log(responseStatus);

  switch (responseStatus) {
    case 200:
      responseMessage = `SUCCESS: Reset status of all classes`;
      break;
    case 500:
      responseMessage = `ERROR: Couldn't update status of sll classes`;
      break;
    default:
      responseMessage = `UNDEFINED: Unknown error`;
  }

  console.log(responseMessage);

  context.res = {
    status: responseStatus,
    body: responseMessage,
  };
};

async function getClasses() {
  const tableService = tableStore.createTableService();
  const statusQuery = new tableStore.TableQuery().select(`PartitionKey`);

  return new Promise(function (resolve) {
    tableService.queryEntities(
      process.env["STATUSTABLE_NAME"],
      statusQuery,
      null,
      function (error, result) {
        if (!error) {
          let entities = result.entries;
          let resultSet = new Array();

          entities.forEach(function (entity) {
            resultSet.push(entity.PartitionKey._);
          });

          resolve(resultSet);
        }
      }
    );
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
          _: "",
        },
        Status: {
          _: 0,
        },
      };

      tableService.replaceEntity(
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
  });
}
