const fs = require('fs');
const _ = require('lodash');

// TODO: memoize
function combos(n, k) {
  let outer = [];
  if (k === 1) {
    return [[`${n}`]];
  } else {
    for (let i = 0; i < n; i++) {
      let recurseResult = combos(n - i, k - 1);
      recurseResult.forEach(r => outer.push(`${i},${r}`));
    }
    outer.push(
      `${n},${Array(k - 1)
        .fill('0')
        .join(',')}`
    );
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
  stream.once('open', _ => {
    stream.write(`${header}\n`);
    portfolios.forEach(portfolio => stream.write(`${portfolio}\n`));
    stream.end();
  });
}

// TODO: Input validation
function generate(input) {
  const assetClasses = fs.readFileSync(input.assetClasses, 'UTF8');
  const projectedReturns = fs.readFileSync(input.projectedReturns, 'UTF8').split(',');
  const risk = fs.readFileSync(input.risk, 'UTF8').split(',');
  const numBuckets = projectedReturns.length;
  const constraints = {
    min: input.minReturn,
    max: input.maxReturn,
  };
  console.log(`generate:
    assetClasses = ${assetClasses},
    projectedReturns = ${projectedReturns},
    risk = ${risk},
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
