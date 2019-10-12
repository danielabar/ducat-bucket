function combos(n, k) {
  console.log(`(${n}, ${k})`)
  let outer = []
  if (k === 1) {
    console.log(`\tBASE n = ${n}`)
    return [
      [`${n}`]
    ]
  } else {
    for (let i = 0; i < n; i++) {
      console.log(`\tFOR LOOP: ${i}`)
      let recurseResult = combos(n - i, k - 1)
      recurseResult.forEach(r => outer.push(`${i},${r}`))
    }
    // FIXME: Should be as many zeroes as buckets minus 1
    outer.push(`${n},0`)
    return outer;
  }
}

console.log(combos(3, 3))
