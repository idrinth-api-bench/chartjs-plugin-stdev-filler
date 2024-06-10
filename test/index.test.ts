import { expect } from "chai";
import { Chart } from "chart.js";

import ChartUtils from "../src/index.ts";

describe("Testing ChartUtils", () => {
  it("Testing afterDatasetsUpdate", () => {

    const _meta = {
      data: [10, 9, 11, 13, 11],
      $stdevFiller: {},
    };

    const chart = {
      data: {
        datasets: [
          {
            label: "example 1",
            data: [10, 9, 11, 13, 11],
            stdev: [1, 1.1, 3, 9, 0.2],
            borderColor: "rgb(0, 0, 0)",
          },
        ],
      },
      getDatasetMeta: (index) => _meta,
      isDatasetVisible: (index) => true,
    };

    ChartUtils.afterDatasetsUpdate(chart);

    const meta = chart.getDatasetMeta(0);

    expect(meta).to.have.property("$stdevFiller");
    expect(meta.$stdevFiller).to.be.ok
    expect(meta.$stdevFiller).to.deep.equal({
      visible: true,
      index: 0,
      color: "rgba(0,0,0,0.1)",
      above: [11, 10.1, 14, 22, 11.2],
      below: [9, 7.9, 8, 4, 10.8],
    });
  });

  it("Testing beforeDatasetDraw", () => {
    
    const _meta = {
      data: [10, 9, 11, 13, 11],
      $stdevFiller: {
        visible: true,
        index: 0,
        color: "rgba(0,0,0,0.1)",
        above: [11, 10.1, 14, 22, 11.2],
        below: [9, 7.9, 8, 4, 10.8],
      },
    };

    const mockCtx = {
      fillStyle: "",
      beginPath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      closePath: () => {},
      fill: () => {},
    };

    const chart = {
      ctx: mockCtx,
      chartArea: { top: 0, left: 0, width: 100, height: 100 },
      scales: {
        x: { getPixelForValue: (value) => value * 10 },
        y: { getPixelForValue: (value) => 100 - value * 10 },
      },
      getDatasetMeta: (index) => _meta,
    };

    const args = { meta: _meta };

    ChartUtils.beforeDatasetDraw(chart, args);

    expect(mockCtx.fillStyle).to.equal("transparent");
  });
});
