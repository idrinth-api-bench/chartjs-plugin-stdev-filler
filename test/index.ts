import { expect } from "chai";
import ChartUtils from "../src/index.ts";
import sinon from "sinon";

describe("Testing ChartUtils", () => {
  it("Testing afterDatasetsUpdate", () => {

    const meta = {
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
      getDatasetMeta: (index) => meta,
      isDatasetVisible: (index) => true,
    };

    ChartUtils.afterDatasetsUpdate(chart);

    expect(meta).to.have.property("$stdevFiller");
    expect(meta.$stdevFiller).to.deep.equal({
      visible: true,
      index: 0,
      color: "rgba(0,0,0,0.1)",
      above: [11, 10.1, 14, 22, 11.2],
      below: [9, 7.9, 8, 4, 10.8],
    });
  });

  it("Testing beforeDatasetDraw", () => {
    
    const meta = {
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
      beginPath: sinon.spy(),
      moveTo: sinon.spy(),
      lineTo: sinon.spy(),
      closePath: sinon.spy(),
      fill: sinon.spy(),
    };

    const chart = {
      ctx: mockCtx,
      chartArea: { top: 0, left: 0, width: 100, height: 100 },
      scales: {
        x: { getPixelForValue: (value) => value * 10 },
        y: { getPixelForValue: (value) => 100 - value * 10 },
      },
      getDatasetMeta: (index) => meta,
    };

    const args = { meta };

    ChartUtils.beforeDatasetDraw(chart, args);

    expect(mockCtx.fillStyle).to.equal("transparent");
    expect(mockCtx.beginPath.calledOnce).to.be.true;
    expect(mockCtx.moveTo.calledOnce).to.be.true;
    expect(mockCtx.lineTo.called).to.be.true;
    expect(mockCtx.closePath.calledOnce).to.be.false;
    expect(mockCtx.fill.calledOnce).to.be.true;
  });
});
