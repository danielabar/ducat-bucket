const fs = require('fs');

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

// TODO: get num buckets from input rather than hard-coding data[5]
// TODO: Consider diversification score TBD
// TODO: Wrap in promise and resolve lineCount https://stackoverflow.com/questions/39880832/how-to-return-a-promise-when-writestream-finishes
function saveCsv(constraints, combos, filePath, header) {
  const stream = fs.createWriteStream(filePath);
  let lineCount = 0;
  stream.once('open', fd => {
    stream.write(`${header}\n`);
    combos.forEach(combo => {
      // hack - should know num buckets to know where return is
      const data = combo.split(',');
      if (data[5] >= constraints.min && data[5] <= constraints.max) {
        stream.write(`${combo}\n`);
        lineCount += 1;
      }
    });
    stream.end();
  });
  return lineCount;
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
  const comb = combos(100, numBuckets);
  const weighted = calcWeights(comb, projectedReturns, risk);
  const outFile = `data/out/${Date.now()}.csv`;
  const numPortfolios = saveCsv(
    constraints,
    weighted,
    outFile,
    `${assetClasses},Weighted Return,Weighted Risk`
  );
  console.log(`Generated ${numPortfolios} portfolios, see: ${outFile}`);
}

module.exports = {
  generate,
};
