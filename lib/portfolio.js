const fs = require('fs');
const _ = require('lodash');

// TODO: memoize test
function combos(n, k) {
  let outer = [];
  if (k === 1) {
    return [[`${n}`]];
  } else {
    // start at 1 rather than 0 to ensure at least some min diversification
    for (let i = 1; i < n; i++) {
      let recurseResult = combos(n - i, k - 1);
      recurseResult.forEach(r => outer.push(`${i},${r}`));
    }
    // do not include any zero's
    // outer.push(
    //   `${n},${Array(k - 1)
    //     .fill('0')
    //     .join(',')}`
    // );
    return outer;
  }
}

function calcWeights(combos, projectedReturns, risk) {
  return combos.map(combo => {
    let wr = combo.split(',').reduce((acc, cur, idx) => {
      return acc + (cur / 100) * projectedReturns[idx];
    }, 0);
    let wk = combo.split(',').reduce((acc, cur, idx) => {
      return acc + (cur / 100) * risk[idx];
    }, 0);
    return `${combo},${wr.toFixed(2)},${wk.toFixed(2)}`;
  });
}

// TODO: Consider diversification score TBD
function filterPortfolios(combos, constraints, numBuckets) {
  return combos.filter(combo => {
    const data = combo.split(',');
    const weightedReturn = data[numBuckets];
    return weightedReturn >= constraints.min && weightedReturn <= constraints.max;
  });
}

function sortPortfolios(portfolios, numBuckets) {
  const portObjs = portfolios.map(p => {
    const values = p.split(',');
    return {
      orig: p,
      weightedReturn: parseFloat(values[numBuckets]),
      weightedRisk: parseFloat(values[numBuckets + 1]),
    };
  });
  const sorted = _.sortBy(portObjs, ['weightedReturn', 'weightedRisk']);
  return sorted.map(s => s.orig);
}

function saveCsv(portfolios, filePath, header) {
  const stream = fs.createWriteStream(filePath);
  stream.once('open', () => {
    stream.write(`${header}\n`);
    portfolios.forEach(portfolio => stream.write(`${portfolio}\n`));
    stream.end();
  });
}

// https://stackoverflow.com/questions/5294955/how-to-scale-down-a-range-of-numbers-with-a-known-min-and-max-value
function scaleStandardDeviation(standardDeviations) {
  const scaleMin = 1;
  const scaleMax = 10;
  const sdArray = standardDeviations.map(sd => parseFloat(sd));
  const rangeMin = Math.min(...sdArray);
  const rangeMax = Math.max(...sdArray);

  return sdArray.map(sd => {
    const numerator = (scaleMax - scaleMin) * (sd - rangeMin);
    const denominator = rangeMax - rangeMin;
    return numerator / denominator + scaleMin;
  });
}

// TODO: Input validation
function generate(input) {
  const assetClasses = fs.readFileSync(input.assetClasses, 'UTF8');
  const projectedReturns = fs.readFileSync(input.projectedReturns, 'UTF8').split(',');
  const standardDeviation = fs.readFileSync(input.standardDeviation, 'UTF8').split(',');
  const risk = scaleStandardDeviation(standardDeviation);
  const numBuckets = projectedReturns.length;
  const constraints = {
    min: input.minReturn,
    max: input.maxReturn,
  };
  console.log(`generate:
    assetClasses = ${assetClasses},
    projectedReturns = ${projectedReturns},
    risk (scaled 1-10 from standard deviation) = ${risk},
    numBuckets = ${numBuckets},
    constraints = ${JSON.stringify(constraints)}
  `);
  const allPortfolios = combos(100, numBuckets);
  const weightedPortfolios = calcWeights(allPortfolios, projectedReturns, risk);
  const filteredPortfolios = filterPortfolios(weightedPortfolios, constraints, numBuckets);
  const sortedPortfolios = sortPortfolios(filteredPortfolios, numBuckets);
  const outFile = `data/out/${Date.now()}.csv`;
  saveCsv(sortedPortfolios, outFile, `${assetClasses},Weighted Return,Weighted Risk`);
  console.log(
    `Considered ${allPortfolios.length} portfolios, filtered down to ${filteredPortfolios.length}, see: ${outFile}`
  );
}

module.exports = {
  generate,
};
