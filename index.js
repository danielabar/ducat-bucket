#!/usr/bin/env node

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

  .alias('s', 'standardDeviationFile')
  .nargs('s', 1)
  .describe('s', 'Path to csv file containing standard deviation for each asset class')
  .demandOption(['s'])

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
  Inputs:
    Asset Classes:\t\t\t${argv.a}
    Projected Returns:\t\t\t${argv.p}
    Standard Deviation:\t\t\t\t${argv.s}
    Desired Minimum Return:\t\t\t${argv.i}
    Desired Maximum Return:\t\t\t${argv.x}
`);
portfolio.generate({
  assetClasses: argv.a,
  projectedReturns: argv.p,
  standardDeviation: argv.s,
  minReturn: argv.i,
  maxReturn: argv.x,
});
