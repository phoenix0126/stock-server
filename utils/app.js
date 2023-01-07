const axios = require("axios");
const { PrismaClient } = require("@prisma/client");
const sgMail = require("@sendgrid/mail");

const prisma = new PrismaClient();

const timeFrames = [
  {
    type: 1,
    days: 7,
    label: "1 week",
  },
  {
    type: 2,
    days: 31,
    label: "1 month",
  },
  {
    type: 3,
    days: 95,
    label: "3 months",
  },
  {
    type: 4,
    days: 183,
    label: "6 months",
  },
  {
    type: 5,
    days: 365,
    label: "1 year",
  },
  {
    type: 6,
    days: 365 * 2,
    label: "2 years",
  },
  {
    type: 7,
    days: 365 * 3,
    label: "3 years",
  },
  {
    type: 8,
    days: 365 * 5,
    label: "5 years",
  },
  {
    type: 9,
    days: 365 * 10,
    label: "10 years",
  },
  {
    type: 10,
    label: "All",
  },
];

const indexes = [
  { symbol: "^IBEX", no: 0 },
  { symbol: "^RUA", no: 1 },
  { symbol: "^AEX", no: 2 },
  { symbol: "^DJT", no: 3 },
  { symbol: "^MID", no: 4 },
  { symbol: "^NDX", no: 5 },
  { symbol: "^STI", no: 6 },
  { symbol: "^BVSP", no: 7 },
  { symbol: "^MXX", no: 8 },
  { symbol: "^FTSE", no: 9 },
  { symbol: "^GSPC", no: 10 },
  { symbol: "^IXIC", no: 11 },
  { symbol: "^BSESN", no: 12 },
  { symbol: "^KS11", no: 13 },
  { symbol: "^KLSE", no: 14 },
  { symbol: "^TWII", no: 15 },
  { symbol: "^N225", no: 16 },
  { symbol: "^NZ50", no: 17 },
  { symbol: "^AORD", no: 18 },
  { symbol: "^RUT", no: 19 },
  { symbol: "^GDAXI", no: 20 },
  { symbol: "^JKSE", no: 21 },
  { symbol: "^HSI", no: 22 },
  { symbol: "^NSEI", no: 23 },
  { symbol: "^NSEBANK", no: 24 },
  { symbol: "IMOEX.ME", no: 25 },
  { symbol: "^FCHI", no: 26 },
  { symbol: "^TA125.TA", no: 27 },
  { symbol: "^HSCE", no: 28 },
];

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const getSettings = async () => {
  const settings = await prisma.mailSetting.findMany();
  return settings;
};

const getActiveSettings = async () => {
  const settings = await prisma.mailSetting.findMany({
    where: {
      active: true,
    },
  });

  return settings;
};

const runProcess = async (from, to) => {
  // get all pairs
  let pairs = indexes.reduce(
    (acc, first, i) =>
      acc.concat(indexes.slice(i + 1).map((second) => ({ first, second }))),
    []
  );

  let result = [];

  for(let pairIndex = 0; pairIndex < pairs.length; pairIndex++) {
    let firstIndexInfoAll = [];
    let secondIndexInfoAll = [];

    let result = null;
    result = await axios.get(
      `https://financialmodelingprep.com/api/v3/historical-price-full/${indexes[
        pairs[pairIndex].first.no
      ].symbol.replace(
        "^",
        "%5E"
      )}?apikey=5b76a0aef20ac58263f0827068b37e59&from=2000-10-10`
    );

    result.data.historical.forEach((data) => {
      firstIndexInfoAll.push([
        data.date,
        data.close
      ])
    })

    result = await axios.get(
      `https://financialmodelingprep.com/api/v3/historical-price-full/${indexes[
        pairs[pairIndex].second.no
      ].symbol.replace(
        "^",
        "%5E"
      )}?apikey=5b76a0aef20ac58263f0827068b37e59&from=2000-10-10`
    );

    result.data.historical.forEach((data) => {
      secondIndexInfoAll.push([
        data.date,
        data.close
      ])
    })

    for(let timeframeIndex = 0; timeframeIndex < timeFrames.length; timeframeIndex++) {
      // get R & Gap(Today)
      let sumX = 0.0;
      let sumY = 0.0;
      let sumXY = 0.0;
      let sumX2 = 0.0;
      let sumY2 = 0.0;
      let n = 0;
      let differencePercent = [];

      // from, to
      let date = new Date();
      const to = getDate(date);
      date.setDate(date.getDate() - timeFrames[timeframeIndex].days);
      const from = timeFrames[timeframeIndex].type === 10 ? "2000-10-10" : getDate(date);

      let firstIndexInfo = firstIndexInfoAll.filter((info) => new Date(info[0]).getTime() >= new Date(from).getTime());
      let secondIndexInfo = secondIndexInfoAll.filter((info) => new Date(info[0]).getTime() >= new Date(from).getTime());

      // get correlation
      firstIndexInfo.forEach(function (first, a) {
        if (
          secondIndexInfo.find(
            (second) =>
              second[0] === first[0]
          )
        ) {
          const found = secondIndexInfo.find(
            (second) =>
              second[0] === first[0]
          );
          const b = secondIndexInfo.indexOf(found);
          const firstPercent =
            ((firstIndexInfo[a][1] -
              firstIndexInfo[firstIndexInfo.length - 1][1]) /
              firstIndexInfo[firstIndexInfo.length - 1][1]) *
            100;
          const secondPercent =
            ((secondIndexInfo[b][1] -
              secondIndexInfo[secondIndexInfo.length - 1][1]) /
              secondIndexInfo[secondIndexInfo.length - 1][1]) *
            100;

          differencePercent.push(firstPercent - secondPercent);

          sumX += firstIndexInfo[a][1];
          sumY += secondIndexInfo[b][1];
          sumXY += firstIndexInfo[a][1] * secondIndexInfo[b][1];
          sumX2 += Math.pow(firstIndexInfo[a][1], 2);
          sumY2 += Math.pow(secondIndexInfo[b][1], 2);

          n++;
        }
      });

      const mean = differencePercent.reduce((a, b) => a + b, 0) / n;
      const gap = differencePercent[0];

      const SD = Math.sqrt(
        differencePercent
          .map((x) => Math.pow(x - mean, 2))
          .reduce((a, b) => a + b, 0) / n
      );

      const R =
        n * sumXY === sumX * sumY
          ? 0
          : (n * sumXY - sumX * sumY) /
            Math.pow(
              (n * sumX2 - Math.pow(sumX, 2)) * (n * sumY2 - Math.pow(sumY, 2)),
              0.5
            );
      
      if(gap === NaN || gap === undefined || SD === 0 || SD === NaN || SD === undefined) continue

      // insert analyze data
      // check exist
      const isExist = await prisma.AnalyzeIndice.count({
        where: {
          pairID: pairIndex,
          range: timeframeIndex + 1
        }
      })
      console.log(`Pair: ${pairs[pairIndex].first.symbol} - ${pairs[pairIndex].second.symbol}: from: ${from}, to: ${to}`, R, gap, SD, Math.abs(gap / SD));
      if(isExist === 0) // create
      {
        await prisma.AnalyzeIndice.create({
          data: {
            pairID: pairIndex,
            range: timeframeIndex + 1,
            pair: pairs[pairIndex].first.symbol + "-" + pairs[pairIndex].second.symbol,
            correlation: R,
            gap: gap,
            sd: SD,
            xsd: Math.abs(gap / SD)
          }
        })
      } else { // update
        await prisma.AnalyzeIndice.updateMany({
          where: {
            pairID: pairIndex,
            range: timeframeIndex + 1,
          },
          data: {
            correlation: R,
            gap: gap,
            sd: SD,
            xsd: Math.abs(gap / SD)
          }
        })
      }
    }
  }

  return result;
};

const sendMessage = (text) => {
  const msg = {
    to: "discrepancycharts@gmail.com",
    from: "tradingdiscrepancy@gmail.com", // Use the email address or domain you verified above
    subject: "Take a look at the following",
    html: text,
  };

  sgMail.send(msg).then(
    () => {
      console.log("sent");
    },
    (error) => {
      console.error(error);

      if (error.response) {
        console.error(error.response.body);
      }
    }
  );
};

const getMessage = async (minXSD, timeframe) => {
  const result = {};

  result.data = [];
  result.title = `The following is the information for ${
    timeFrames[timeframe - 1].label
  }`;

  result.data = await prisma.AnalyzeIndice.findMany({
    orderBy: {
      xsd: 'desc'
    },
    take: 20,
    where: {
      xsd: {
        gte: minXSD
      },
      range: timeframe
    }
  })

  return result;
}

const getDate = (date) => {
  return (
    date.getFullYear() + "-" + (date.getMonth() + 1 < 10 ? '0' : '') + (date.getMonth() + 1) + "-" + (date.getDate() < 10 ? '0' : '') + date.getDate()
  );
};

module.exports = {
  getSettings: getSettings,
  getActiveSettings: getActiveSettings,
  runProcess: runProcess,
  getMessage: getMessage,
  sendMessage: sendMessage,
  getDate: getDate,
  timeFrames: timeFrames,
};
