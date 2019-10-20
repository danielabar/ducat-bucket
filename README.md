# ducat-bucket

> A CLI to determine optimal asset allocation to meet your retirement goals while taking on as little risk as possible.

Proof of concept for now, documentation and tests TBD...

**Example Usage**

```shell
$ node --max-old-space-size=8192 index.js -a data/in/asset-classes.csv -p data/in/projected-returns.csv -s data/in/standard-deviation.csv -i 4.2 -x 4.2
```

## Reference Material

* [2019 Projected Returns by Asset Class](https://www.iqpf.org/en/Account/news/news/2019/04/30/default-calendar/2019-projection-assumption-guidelines)
* [Weighted Average Calculator](https://financeformulas.net/Weighted_Average.html)
