const tableStore = require(`azure-storage`);

module.exports = async function (context, req) {
  context.res = {
    status: 200,
    body: await getTestStatus(),
    headers: {
      'Content-Type': 'application/json',
      'X-Content-Type-Options': 'nosniff',
    },
  };
};

async function getTestStatus() {
  const tableService = tableStore.createTableService();
  const statusQuery = new tableStore.TableQuery().select([`PartitionKey`, `Status`]);

  return new Promise(function (resolve, reject) {
    tableService.queryEntities(process.env['STATUSTABLE_NAME'], statusQuery, null, function (error, result) {
      if (!error) {
        let entities = result.entries;
        let resultSet = new Array();

        entities.forEach(function (entity) {
          resultSet.push({
            class: entity.PartitionKey._,
            status: entity.Status._,
          });
        });

        resolve(JSON.stringify(resultSet));
      } else {
        reject(error.message);
      }
    });
  });
}
