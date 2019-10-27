# ducat-bucket

> A CLI to determine optimal asset allocation to meet your retirement goals while taking on as little risk as possible.

Proof of concept for now, documentation and tests TBD...

**Example Usage**

```shell
# IQPF projections
$ node --max-old-space-size=8192 index.js -o iqpf -a data/in/iqpf/asset-classes.csv -p data/in/iqpf/projected-returns.csv -s data/in/iqpf/standard-deviation.csv -i 4.2 -x 4.2

# PWL projections
$ node --max-old-space-size=8192 index.js -o pwl -a data/in/pwl/asset-classes.csv -p data/in/pwl/projected-returns.csv -s data/in/pwl/standard-deviation.csv -i 4.1 -x 4.3

# CPM projections
$ node --max-old-space-size=8192 index.js -o cpm -a data/in/cpm/asset-classes.csv -p data/in/cpm/projected-returns.csv -s data/in/cpm/standard-deviation.csv -i 4.1 -x 4.1

# PWL projections ex emerging markets
$ node --max-old-space-size=8192 index.js -o pwl-no-emerg -a data/in/pwl-no-emerg/asset-classes.csv -p data/in/pwl-no-emerg/projected-returns.csv -s data/in/pwl-no-emerg/standard-deviation.csv -i 4.1 -x 4.3
```

## Reference Material

* [IQPF 2019 Projected Returns by Asset Class](https://www.iqpf.org/en/Account/news/news/2019/04/30/default-calendar/2019-projection-assumption-guidelines)
* [PWL Capital Projected Returns as of Dec 2018](https://www.pwlcapital.com/wp-content/uploads/2019/03/PWL-WP-Kerzerho-Bortolotti-Great-Expectations-2019.pdf)
* [CPM Projected Returns as of Jun. 2019](https://www.canadianportfoliomanagerblog.com/ask-bender-expected-returns-for-the-vanguard-asset-allocation-etfs/)
* [Weighted Average Calculator](https://financeformulas.net/Weighted_Average.html)
