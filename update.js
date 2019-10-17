const dynamodb = require("serverless-dynamodb-client").doc;
const fetch = require("node-fetch");

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

const update = async () => {
  const res = await fetch("http://ishetlekkerindemess.be/export");
  const json = await res.json();

  await asyncForEach(json, async day => {
    const { date, soup, meat, veggie, light, grill, vegetables } = day;
    console.log(`Upserting ${date}`);
    try {
      const values = {};
      const fields = ["soup", "meat", "veggie", "light", "grill", "vegetables"];
      const updateExpression = [];
      fields.forEach(f => {
        if (day[f]) {
          values[`:${f}`] = day[f];
          updateExpression.push(`${f} = :${f}`);
        }
      });
      console.log({
        Key: {
          date
        },
        UpdateExpression: `SET ${updateExpression.join(", ")}`,
        ExpressionAttributeValues: values
      });
      const res = await dynamodb
        .update({
          TableName: process.env.MENU_TABLE,
          Key: {
            date
          },
          UpdateExpression: `SET ${updateExpression.join(", ")}`,
          ExpressionAttributeValues: values
        })
        .promise();
    } catch (e) {
      console.log(e);
    }
  });

  return {
    statusCode: 200,
    body: json.length
  };
};

module.exports = update;
