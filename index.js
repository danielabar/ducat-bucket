function combos(n, k) {
  let outer = []
  if (k === 1) {
    return [
      [`${n}`]
    ]
  } else {
    for (let i = 0; i < n; i++) {
      let recurseResult = combos(n - i, k - 1)
      recurseResult.forEach(r => outer.push(`${i},${r}`))
    }
    outer.push(`${n},${Array(k - 1).fill('0').join(',')}`)
    return outer;
  }
}

function calcWeights(combos, projectedReturns, risk) {
  return combos.map(combo => {
    let wr = combo.split(',').reduce((acc, cur, idx) => {
      return acc + ((cur / 100) * projectedReturns[idx])
    }, 0);
    let wk = combo.split(',').reduce((acc, cur, idx) => {
      return acc + ((cur / 100) * risk[idx])
    }, 0);
    return `${combo},${wr.toFixed(2)},${wk.toFixed(2)}`;
  })
}

const comb = combos(100, 4)
const weighted = calcWeights(comb, [2.3, 3.9, 6.1, 6.4], [1, 4, 7, 8])
console.log(`${JSON.stringify(weighted, null, 2)}\nNum Combos = ${comb.length}`)
