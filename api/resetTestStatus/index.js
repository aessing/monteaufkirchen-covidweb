const tableStore = require(`azure-storage`);

module.exports = async function (context, resetTestStatusTimer) {
  let classes = await getClasses();
  let responseStatus = await resetTestStatus(classes);
};

async function getClasses() {
  const tableService = tableStore.createTableService();
  const statusQuery = new tableStore.TableQuery().select(`PartitionKey`);

  return new Promise(function (resolve, reject) {
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
        } else {
          reject(error.message);
        }
      }
    );
  });
}

async function resetTestStatus(classList) {
  const tableService = tableStore.createTableService();

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
      function (error) {}
    );
  });
}
