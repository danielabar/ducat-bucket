#!/usr/bin/env node

// node --max-old-space-size=8192 index.js -a data/in/asset-classes.csv -p data/in/projected-returns.csv -r data/in/risk.csv -i 4 -x 5
const argv = require('yargs')
  .usage('TBD')

  .alias('a', 'assetClassesFile')
  .nargs('a', 1)
  .describe('a', 'Path to csv file containing asset classes')
  .demandOption(['a'])

  .alias('p', 'projectedReturnsFile')
  .nargs('p', 1)
  .describe('p', 'Path to csv file containing projected returns for each asset class')
  .demandOption(['p'])

  .alias('r', 'riskFile')
  .nargs('r', 1)
  .describe('r', 'Path to csv file containing risk rating for each asset class')
  .demandOption(['r'])

  .alias('i', 'minReturn')
  .nargs('i', 1)
  .describe('i', 'Desired minimum return')
  .demandOption(['i'])

  .alias('x', 'maxReturn')
  .nargs('x', 1)
  .describe('x', 'Desired maximum return')
  .demandOption(['x'])

  .help('h')
  .alias('h', 'help').argv;
const portfolio = require('./lib/portfolio');

console.log(`
  Generating portfolios for:
    Asset Classes:\t\t\t${argv.a}
    Projected Returns:\t\t\t${argv.p}
    Risk:\t\t\t\t${argv.r}
    Desired Minimum Return:\t\t\t${argv.i}
    Desired Maximum Return:\t\t\t${argv.x}
`);
portfolio.generate({
  assetClasses: argv.a,
  projectedReturns: argv.p,
  risk: argv.r,
  minReturn: argv.i,
  maxReturn: argv.x,
});
