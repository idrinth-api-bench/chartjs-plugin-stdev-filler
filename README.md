# @idrinth-api-bench/chartjs-plugin-stdev-filler

This tiny plugin adds a colored area around line charts if those provide a standard deviation value.

## Config

```js
{
  datasets: [
    {
      label: 'example 1',
      data: [10, 9, 11, 13, 11],
      stdev: [1, 1.1, 3, 9, 0.2],
    }
  ]
}
```
