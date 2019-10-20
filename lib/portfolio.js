const fs = require('fs');
const _ = require('lodash');

// TODO: memoize
function combos(n, k) {
  let outer = [];
  if (k === 1) {
    return [[`${n}`]];
  } else {
    // go up in multiples of 5 to ensure diversification
    for (let i = 5; i < n; i += 5) {
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

function calcDiversification(portfolios, numBuckets, divMinMax) {
  return portfolios.map(portfolio => {
    const data = portfolio.split(',').slice(0, numBuckets);
    const sumDiff = data.reduce((acc, cur) => {
      return acc + Math.abs(cur - divMinMax.perfect);
    }, 0);
    const numerator = (divMinMax.scaleMax - divMinMax.scaleMin) * (sumDiff - divMinMax.rangeMin);
    const denominator = divMinMax.rangeMax - divMinMax.rangeMin;
    const scaledDiversification = numerator / denominator + divMinMax.scaleMin;
    const scaledDiversificationFinal = Math.abs(divMinMax.scaleMax - scaledDiversification + 1);
    return `${portfolio},${scaledDiversificationFinal.toFixed(2)}`;
  });
}

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
      diverse: parseFloat(values[numBuckets + 2]),
    };
  });
  const sorted = _.sortBy(portObjs, ['weightedReturn', 'weightedRisk', 'diverse']);
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

function diversityMinMax(numBuckets) {
  const perfectlyEven = 100 / numBuckets;
  const firstSum = 100 - perfectlyEven;
  const otherSums = Math.abs(0 - perfectlyEven) * (numBuckets - 1);
  return {
    scaleMin: 1,
    scaleMax: 10,
    rangeMin: 0,
    rangeMax: firstSum + otherSums,
    perfect: perfectlyEven,
  };
}

// TODO: Input validation
function generate(input) {
  const assetClasses = fs.readFileSync(input.assetClasses, 'UTF8');
  const projectedReturns = fs.readFileSync(input.projectedReturns, 'UTF8').split(',');
  const standardDeviation = fs.readFileSync(input.standardDeviation, 'UTF8').split(',');
  const volatility = scaleStandardDeviation(standardDeviation);
  const numBuckets = projectedReturns.length;
  const diversityRange = diversityMinMax(numBuckets);
  const constraints = {
    min: input.minReturn,
    max: input.maxReturn,
  };
  console.log(`Generating portfolios for:
    assetClasses = ${assetClasses},
    projectedReturns = ${projectedReturns},
    risk (scaled 1-10 from standard deviation) = ${volatility},
    numBuckets = ${numBuckets},
    diversityRange (low value = high diversity) = ${JSON.stringify(diversityRange)},
    constraints = ${JSON.stringify(constraints)}
  `);
  const allPortfolios = combos(100, numBuckets);
  const weightedPortfolios = calcWeights(allPortfolios, projectedReturns, volatility);
  const filteredPortfolios = filterPortfolios(weightedPortfolios, constraints, numBuckets);
  const withDiversification = calcDiversification(filteredPortfolios, numBuckets, diversityRange);
  const sortedPortfolios = sortPortfolios(withDiversification, numBuckets);
  const outFile = `data/out/${Date.now()}.csv`;
  saveCsv(
    sortedPortfolios,
    outFile,
    `${assetClasses},Weighted Return,Weighted Volatility (1 Low - 10 High),Diversification (1 Low - 10 High)`
  );
  console.log(
    `Considered ${allPortfolios.length} portfolios, filtered down to ${filteredPortfolios.length}, see: ${outFile}`
  );
}

module.exports = {
  generate,
};
