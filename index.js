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

const comb = combos(10, 5)
console.log(`${JSON.stringify(comb, null, 2)}\nNum Combos = ${comb.length}`)
// 4,598,126
